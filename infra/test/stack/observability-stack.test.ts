import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Template } from 'aws-cdk-lib/assertions';
import { ObservabilityStack } from '../../lib/stack/observability/observability-stack';
import { testConfig } from '../test-config';

describe('ObservabilityStack', () => {
  let app: cdk.App;
  let vpc: ec2.IVpc;
  let ecsService: ecs.FargateService;
  let rdsCluster: rds.DatabaseCluster;
  let lambdaFunction: lambda.Function;
  let loadBalancer: elbv2.ApplicationLoadBalancer;
  let stack: ObservabilityStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    
    // Create mock resources
    const mockStack = new cdk.Stack(app, 'MockStack', {
      env: {
        account: '123456789012',
        region: 'ap-northeast-1',
      },
    });

    // Mock VPC
    vpc = new ec2.Vpc(mockStack, 'MockVpc', {
      maxAzs: 2,
    });

    // Mock ECS Service
    const cluster = new ecs.Cluster(mockStack, 'MockCluster', { vpc });
    const taskDefinition = new ecs.FargateTaskDefinition(mockStack, 'MockTaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
    });
    taskDefinition.addContainer('app', {
      image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
    });
    ecsService = new ecs.FargateService(mockStack, 'MockEcsService', {
      cluster,
      taskDefinition,
    });

    // Mock RDS Cluster
    rdsCluster = new rds.DatabaseCluster(mockStack, 'MockRdsCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_3,
      }),
      writer: rds.ClusterInstance.serverlessV2('writer'),
      vpc,
    });

    // Mock Lambda Function
    lambdaFunction = new lambda.Function(mockStack, 'MockLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => {};'),
    });

    // Mock ALB
    loadBalancer = new elbv2.ApplicationLoadBalancer(mockStack, 'MockAlb', {
      vpc,
      internetFacing: true,
    });

    // Create Observability Stack
    stack = new ObservabilityStack(
      app,
      'TestObservabilityStack',
      testConfig,
      {
        ecsService: ecsService,
        rdsCluster: rdsCluster,
        lambdaFunction: lambdaFunction,
        alb: loadBalancer,
        env: {
          account: '123456789012',
          region: 'ap-northeast-1',
        },
      }
    );

    template = Template.fromStack(stack);
  });

  describe('CloudWatch Dashboard', () => {
    it('should create a CloudWatch dashboard', () => {
      template.resourceCountIs('AWS::CloudWatch::Dashboard', 1);
    });

    it('should have correct dashboard name', () => {
      template.hasResourceProperties('AWS::CloudWatch::Dashboard', {
        DashboardName: `${testConfig.envName}-cdk-template-dashboard`,
      });
    });

    it('should have dashboard body with widgets', () => {
      const dashboards = template.findResources('AWS::CloudWatch::Dashboard');
      const dashboardKeys = Object.keys(dashboards);
      expect(dashboardKeys.length).toBe(1);
      
      const dashboard = dashboards[dashboardKeys[0]];
      expect(dashboard.Properties.DashboardBody).toBeDefined();
      
      const body = JSON.parse(dashboard.Properties.DashboardBody);
      expect(body.widgets).toBeDefined();
      expect(body.widgets.length).toBeGreaterThan(0);
    });
  });

  describe('CloudWatch Alarms', () => {
    it('should create ECS CPU utilization alarm', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: 'CPUUtilization',
        Namespace: 'AWS/ECS',
        Statistic: 'Average',
        Threshold: 80,
        ComparisonOperator: 'GreaterThanThreshold',
      });
    });

    it('should create ECS memory utilization alarm', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: 'MemoryUtilization',
        Namespace: 'AWS/ECS',
        Statistic: 'Average',
        Threshold: 80,
        ComparisonOperator: 'GreaterThanThreshold',
      });
    });

    it('should create RDS CPU utilization alarm', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: 'CPUUtilization',
        Namespace: 'AWS/RDS',
        Statistic: 'Average',
        Threshold: 80,
        ComparisonOperator: 'GreaterThanThreshold',
      });
    });

    it('should create Lambda error alarm', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: 'Errors',
        Namespace: 'AWS/Lambda',
        Statistic: 'Sum',
        Threshold: 5,
        ComparisonOperator: 'GreaterThanThreshold',
      });
    });

    it('should create Lambda throttle alarm', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: 'Throttles',
        Namespace: 'AWS/Lambda',
        Statistic: 'Sum',
        Threshold: 10,
        ComparisonOperator: 'GreaterThanThreshold',
      });
    });

    it('should create ALB target response time alarm', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: 'TargetResponseTime',
        Namespace: 'AWS/ApplicationELB',
        Statistic: 'Average',
        Threshold: 1,
        ComparisonOperator: 'GreaterThanThreshold',
      });
    });

    it('should create ALB 5XX error alarm', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: 'HTTPCode_Target_5XX_Count',
        Namespace: 'AWS/ApplicationELB',
        Statistic: 'Sum',
        Threshold: 10,
        ComparisonOperator: 'GreaterThanThreshold',
      });
    });
  });

  describe('Alarm Configuration', () => {
    it('should have correct evaluation periods', () => {
      const alarms = template.findResources('AWS::CloudWatch::Alarm');
      Object.values(alarms).forEach((alarm: any) => {
        expect(alarm.Properties.EvaluationPeriods).toBeDefined();
        expect(alarm.Properties.EvaluationPeriods).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have treat missing data configured', () => {
      const alarms = template.findResources('AWS::CloudWatch::Alarm');
      Object.values(alarms).forEach((alarm: any) => {
        expect(alarm.Properties.TreatMissingData).toBeDefined();
      });
    });
  });

  describe('Outputs', () => {
    it('should export dashboard name', () => {
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toContain('DashboardName');
    });
  });

  describe('Stack Properties', () => {
    it('should synthesize successfully', () => {
      expect(() => app.synth()).not.toThrow();
    });
  });
});

