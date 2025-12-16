import { Construct } from 'constructs';
import { LambdaConstruct } from '../construct/compute/lambda-construct';
import { ApiGatewayConstruct } from '../construct/api/api-gateway-construct';
import {
  EcsConstruct,
  FargateTaskDefinitionConstruct,
  FargateServiceConstruct,
} from '../construct/compute/ecs-construct';
import { AlbConstruct } from '../construct/networking/alb-construct';
import { SecurityGroupConstruct } from '../construct/networking/security-group-construct';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';

export interface ApiResourceProps {
  /**
   * Lambda関数名
   */
  lambdaFunctionName: string;
  /**
   * API Gateway名
   */
  apiGatewayName: string;
  /**
   * ECSクラスター名
   */
  ecsClusterName: string;
  /**
   * ECSサービス名
   */
  ecsServiceName: string;
  /**
   * ALB名
   */
  albName: string;
  /**
   * VPC
   */
  vpc: ec2.IVpc;
  /**
   * コンテナイメージ（ECS用）
   */
  containerImage?: ecs.ContainerImage;
  /**
   * Lambda設定（undefinedの場合、Lambdaは作成されません）
   */
  lambdaConfig?: {
    memorySize?: number;
    timeout?: number;
    reservedConcurrency?: number;
  };
}

/**
 * レイヤー2: APIResource（機能単位）
 * 
 * 責務: API基盤全体を提供
 * - Lambda関数（軽量API）※オプショナル
 * - API Gateway（Lambda統合）※Lambda有効時のみ
 * - ECSクラスター（長時間実行API）
 * - Application Load Balancer（ECS統合）
 * 
 * 含まれるConstruct: LambdaConstruct, ApiGatewayConstruct, EcsConstruct, AlbConstruct
 * 
 * 変更頻度: 週1-2回（API機能追加・修正）
 */
export class ApiResource extends Construct {
  public readonly lambdaFunction?: lambda.Function;
  public readonly apiGateway?: apigateway.RestApi;
  public readonly ecsCluster: ecs.Cluster;
  public readonly ecsService: ecs.FargateService;
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly ecsSecurityGroup: ec2.ISecurityGroup;
  public readonly albSecurityGroup: ec2.ISecurityGroup;

  constructor(scope: Construct, id: string, props: ApiResourceProps) {
    super(scope, id);

    // Lambda関数の作成（設定がある場合のみ）
    if (props.lambdaConfig) {
    const lambdaConstruct = new LambdaConstruct(this, 'LambdaConstruct', {
      functionName: props.lambdaFunctionName,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
        memorySize: props.lambdaConfig.memorySize,
        timeout: props.lambdaConfig.timeout,
        // Note: reservedConcurrentExecutions はLambdaConstructPropsに未定義のため省略
    });
    this.lambdaFunction = lambdaConstruct.function;

      // API Gatewayの作成（Lambda有効時のみ）
    const apiGatewayConstruct = new ApiGatewayConstruct(this, 'ApiGatewayConstruct', {
      restApiName: props.apiGatewayName,
    });
    this.apiGateway = apiGatewayConstruct.api;

    // Lambda統合
    apiGatewayConstruct.addLambdaIntegration('/hello', 'GET', this.lambdaFunction);
    }

    // ECSクラスターの作成
    const ecsConstruct = new EcsConstruct(this, 'EcsConstruct', {
      clusterName: props.ecsClusterName,
      vpc: props.vpc,
    });
    this.ecsCluster = ecsConstruct.cluster;

    // ECSタスク定義
    const taskDefConstruct = new FargateTaskDefinitionConstruct(
      this,
      'TaskDefConstruct',
      {
        family: `${props.ecsServiceName}-task`,
        cpu: 256,
        memoryLimitMiB: 512,
      }
    );

    // コンテナ定義
    const logGroup = new logs.LogGroup(this, 'EcsLogGroup', {
      logGroupName: `/ecs/${props.ecsServiceName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    taskDefConstruct.addContainer('app', {
      image: props.containerImage || ecs.ContainerImage.fromRegistry('nginx:latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ecs',
        logGroup,
      }),
      portMappings: [
        {
          containerPort: 80,
          protocol: ecs.Protocol.TCP,
        },
      ],
    });

    // セキュリティグループ（ECS）
    const ecsSecurityGroupConstruct = new SecurityGroupConstruct(
      this,
      'EcsSecurityGroup',
      {
        securityGroupName: `${props.ecsServiceName}-sg`,
        vpc: props.vpc,
        description: `Security group for ${props.ecsServiceName}`,
      }
    );
    this.ecsSecurityGroup = ecsSecurityGroupConstruct.securityGroup;

    // Fargateサービス
    const serviceConstruct = new FargateServiceConstruct(this, 'ServiceConstruct', {
      serviceName: props.ecsServiceName,
      cluster: this.ecsCluster,
      taskDefinition: taskDefConstruct.taskDefinition,
      securityGroups: [this.ecsSecurityGroup],
    });
    this.ecsService = serviceConstruct.service;

    // ALBの作成
    const albConstruct = new AlbConstruct(this, 'AlbConstruct', {
      loadBalancerName: props.albName,
      vpc: props.vpc,
    });
    this.alb = albConstruct.alb;
    this.albSecurityGroup = this.alb.connections.securityGroups[0];

    // HTTPリスナー追加
    const listener = albConstruct.addHttpListener(80);

    // ターゲットグループ追加
    listener.addTargets('EcsTarget', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [this.ecsService],
      healthCheck: {
        path: '/',
        interval: Duration.seconds(60),
      },
    });

    // セキュリティグループルール
    this.ecsSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(80),
      'Allow traffic from ALB'
    );
  }
}

