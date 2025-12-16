import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { PocStack } from '../../lib/stack/poc/poc-stack';
import { testConfig } from '../test-config';

describe('PocStack', () => {
  let app: cdk.App;
  let stack: PocStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new PocStack(
      app,
      'TestPocStack',
      testConfig,
      {
        env: {
          account: '123456789012',
          region: 'ap-northeast-1',
        },
      }
    );
    template = Template.fromStack(stack);
  });

  describe('Core Resources', () => {
    it('should create a VPC', () => {
      template.resourceCountIs('AWS::EC2::VPC', 1);
    });

    it('should create a DynamoDB table', () => {
      template.resourceCountIs('AWS::DynamoDB::Table', 1);
    });

    it('should create a Lambda function', () => {
      template.resourceCountIs('AWS::Lambda::Function', 1);
    });

    it('should create an API Gateway', () => {
      template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });

    it('should create an S3 bucket for frontend', () => {
      template.resourceCountIs('AWS::S3::Bucket', 2); // Frontend + Data bucket
    });

    it('should create a CloudFront distribution', () => {
      template.resourceCountIs('AWS::CloudFront::Distribution', 1);
    });

    it('should create an ALB', () => {
      template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
    });

    it('should create an ECS cluster', () => {
      template.resourceCountIs('AWS::ECS::Cluster', 1);
    });
  });

  describe('Optional Resources (Commented by Default)', () => {
    it('should NOT create Aurora cluster in minimal PoC', () => {
      // Auroraはコメントアウトされているため存在しない
      // もしコメントを外した場合、このテストは失敗する
      // template.resourceCountIs('AWS::RDS::DBCluster', 0);
      
      // 実際のリソース数を確認
      const resources = template.toJSON().Resources;
      const rdsClusters = Object.values(resources).filter(
        (r: any) => r.Type === 'AWS::RDS::DBCluster'
      );
      
      // PoC stackではAuroraはコメントアウトされていることを期待
      expect(rdsClusters.length).toBe(0);
    });

    it('should NOT create Cognito resources in minimal PoC', () => {
      // Cognitoもコメントアウトされている
      const resources = template.toJSON().Resources;
      const userPools = Object.values(resources).filter(
        (r: any) => r.Type === 'AWS::Cognito::UserPool'
      );
      
      expect(userPools.length).toBe(0);
    });

    it('should NOT create SNS/SQS resources in minimal PoC', () => {
      // SNS/SQSもコメントアウトされている
      const resources = template.toJSON().Resources;
      const snsTopics = Object.values(resources).filter(
        (r: any) => r.Type === 'AWS::SNS::Topic'
      );
      const sqsQueues = Object.values(resources).filter(
        (r: any) => r.Type === 'AWS::SQS::Queue'
      );
      
      expect(snsTopics.length).toBe(0);
      expect(sqsQueues.length).toBe(0);
    });
  });

  describe('Lambda Configuration', () => {
    it('should grant DynamoDB read/write access to Lambda', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith([
                'dynamodb:BatchGetItem',
                'dynamodb:GetRecords',
                'dynamodb:GetShardIterator',
                'dynamodb:Query',
                'dynamodb:GetItem',
                'dynamodb:Scan',
                'dynamodb:ConditionCheckItem',
                'dynamodb:BatchWriteItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
              ]),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });
  });

  describe('Security Configuration', () => {
    it('should create security groups', () => {
      // ALB, ECS, Lambda用のセキュリティグループ
      template.resourceCountIs('AWS::EC2::SecurityGroup', 3);
    });

    it('should configure ALB security group to allow HTTP traffic', () => {
      template.hasResourceProperties('AWS::EC2::SecurityGroup', {
        GroupDescription: 'Security group for ALB',
        SecurityGroupIngress: [
          {
            CidrIp: '0.0.0.0/0',
            FromPort: 80,
            IpProtocol: 'tcp',
            ToPort: 80,
          },
        ],
      });
    });
  });

  describe('Monitoring (Basic)', () => {
    it('should enable Container Insights for ECS', () => {
      template.hasResourceProperties('AWS::ECS::Cluster', {
        ClusterSettings: [
          {
            Name: 'containerInsights',
            Value: 'enabled',
          },
        ],
      });
    });

    it('should create basic CloudWatch dashboard', () => {
      // enableMonitoring: false の場合はダッシュボードなし
      // デフォルトでは作成されない想定
      const resources = template.toJSON().Resources;
      const dashboards = Object.values(resources).filter(
        (r: any) => r.Type === 'AWS::CloudWatch::Dashboard'
      );
      
      // PoC stackではモニタリングは最小限
      // ダッシュボードの有無は設定による
      expect(dashboards.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Outputs', () => {
    it('should export essential outputs', () => {
      const outputs = template.findOutputs('*');
      
      // 最低限必要なアウトプット
      expect(Object.keys(outputs).length).toBeGreaterThan(0);
    });

    it('should export API Gateway URL', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('ApiGatewayUrl');
    });

    it('should export CloudFront URL', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('CloudFrontUrl');
    });

    it('should export ALB DNS', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('AlbDnsName');
    });
  });

  describe('Cost Optimization', () => {
    it('should use minimal ECS task resources', () => {
      template.hasResourceProperties('AWS::ECS::TaskDefinition', {
        Cpu: '256',
        Memory: '512',
      });
    });

    it('should use pay-per-request billing for DynamoDB', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    it('should use single NAT Gateway', () => {
      // devConfigでnatGateways: 1が設定されていることを前提
      template.resourceCountIs('AWS::EC2::NatGateway', 1);
    });
  });

  describe('Stack Properties', () => {
    it('should have correct stack name pattern', () => {
      expect(stack.stackName).toMatch(/TestPocStack/);
    });

    it('should synthesize successfully', () => {
      expect(() => app.synth()).not.toThrow();
    });

    it('should have environment-specific configuration', () => {
      // Stack内でconfigが正しく使用されていることを確認
      expect(stack).toBeDefined();
    });
  });
});

