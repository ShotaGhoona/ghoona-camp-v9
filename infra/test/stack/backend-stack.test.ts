import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FoundationStack } from '../../lib/stack/foundation/foundation-stack';
import { BackendStack } from '../../lib/stack/backend/backend-stack';
import { testConfig } from '../test-config';

describe('BackendStack', () => {
  let app: cdk.App;
  let foundationStack: FoundationStack;
  let backendStack: BackendStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    
    foundationStack = new FoundationStack(
      app,
      'TestFoundationStack',
      testConfig,
      {
        env: {
          account: '123456789012',
          region: 'ap-northeast-1',
        },
      }
    );

    backendStack = new BackendStack(
      app,
      'TestBackendStack',
      testConfig,
      {
        vpc: foundationStack.vpc,
        env: {
          account: '123456789012',
          region: 'ap-northeast-1',
        },
      }
    );

    template = Template.fromStack(backendStack);
  });

  describe('Lambda Function', () => {
    it('should create a Lambda function', () => {
      template.resourceCountIs('AWS::Lambda::Function', 1);
    });

    it('should use correct runtime', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs20.x',
      });
    });

    it('should have correct memory size', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        MemorySize: 512,
      });
    });

    it('should have correct timeout', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Timeout: 30,
      });
    });

    it('should have environment variables', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: {
            ENVIRONMENT: testConfig.envName,
          },
        },
      });
    });
  });

  describe('ECS Cluster', () => {
    it('should create an ECS cluster', () => {
      template.resourceCountIs('AWS::ECS::Cluster', 1);
    });

    it('should enable Container Insights', () => {
      template.hasResourceProperties('AWS::ECS::Cluster', {
        ClusterSettings: [
          {
            Name: 'containerInsights',
            Value: 'enabled',
          },
        ],
      });
    });
  });

  describe('ECS Task Definition', () => {
    it('should create a task definition', () => {
      template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
    });

    it('should use Fargate compatibility', () => {
      template.hasResourceProperties('AWS::ECS::TaskDefinition', {
        RequiresCompatibilities: ['FARGATE'],
        NetworkMode: 'awsvpc',
      });
    });

    it('should have correct CPU and memory', () => {
      template.hasResourceProperties('AWS::ECS::TaskDefinition', {
        Cpu: '256',
        Memory: '512',
      });
    });

    it('should have a container definition', () => {
      template.hasResourceProperties('AWS::ECS::TaskDefinition', {
        ContainerDefinitions: [
          {
            Name: 'app',
            Image: 'amazon/amazon-ecs-sample',
            Essential: true,
            PortMappings: [
              {
                ContainerPort: 80,
                Protocol: 'tcp',
              },
            ],
          },
        ],
      });
    });
  });

  describe('ECS Service', () => {
    it('should create an ECS service', () => {
      template.resourceCountIs('AWS::ECS::Service', 1);
    });

    it('should have correct desired count', () => {
      template.hasResourceProperties('AWS::ECS::Service', {
        DesiredCount: 1,
      });
    });

    it('should use Fargate launch type', () => {
      template.hasResourceProperties('AWS::ECS::Service', {
        LaunchType: 'FARGATE',
      });
    });
  });

  describe('Application Load Balancer', () => {
    it('should create an ALB', () => {
      template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
    });

    it('should be internet-facing', () => {
      template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
        Scheme: 'internet-facing',
        Type: 'application',
      });
    });

    it('should create a listener', () => {
      template.resourceCountIs('AWS::ElasticLoadBalancingV2::Listener', 1);
    });

    it('should create a target group', () => {
      template.resourceCountIs('AWS::ElasticLoadBalancingV2::TargetGroup', 1);
    });

    it('should have health check configured', () => {
      template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
        HealthCheckEnabled: true,
        HealthCheckIntervalSeconds: 30,
        HealthCheckPath: '/',
        HealthCheckProtocol: 'HTTP',
        HealthyThresholdCount: 2,
        UnhealthyThresholdCount: 3,
      });
    });
  });

  describe('API Gateway', () => {
    it('should create a REST API', () => {
      template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });

    it('should have Lambda integration', () => {
      template.resourceCountIs('AWS::ApiGateway::Method', 1);
    });

    it('should have a deployment', () => {
      template.resourceCountIs('AWS::ApiGateway::Deployment', 1);
    });

    it('should have a stage', () => {
      template.resourceCountIs('AWS::ApiGateway::Stage', 1);
    });
  });

  describe('Security Groups', () => {
    it('should create security groups', () => {
      // ALB SG, ECS SG, Lambda SG
      template.resourceCountIs('AWS::EC2::SecurityGroup', 3);
    });

    it('should configure ALB security group', () => {
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

  describe('Outputs', () => {
    it('should export Lambda function ARN', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('LambdaFunctionArn');
    });

    it('should export ALB DNS name', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('AlbDnsName');
    });

    it('should export API Gateway URL', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('ApiGatewayUrl');
    });
  });

  describe('Stack Properties', () => {
    it('should synthesize successfully', () => {
      expect(() => app.synth()).not.toThrow();
    });
  });
});

