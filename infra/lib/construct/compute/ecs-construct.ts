import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface EcsConstructProps {
  /**
   * クラスター名
   */
  clusterName: string;
  /**
   * VPC
   */
  vpc: ec2.IVpc;
  /**
   * Container Insights有効化
   * @default true
   */
  containerInsights?: boolean;
}

/**
 * レイヤー1: ECSクラスターConstruct（単一リソース）
 * 
 * 責務: 単一のECSクラスターをセキュアなデフォルト設定で抽象化
 * - Container Insightsの有効化
 * - VPCベースの配置
 * 
 * 変更頻度: ほぼなし（AWSベストプラクティスの更新時のみ）
 */
export class EcsConstruct extends Construct {
  public readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: EcsConstructProps) {
    super(scope, id);

    // ECS Cluster（L2コンストラクト）
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: props.clusterName,
      vpc: props.vpc,
      containerInsights: props.containerInsights !== false, // デフォルトtrue
    });
  }
}

export interface FargateServiceConstructProps {
  /**
   * サービス名
   */
  serviceName: string;
  /**
   * ECSクラスター
   */
  cluster: ecs.ICluster;
  /**
   * タスク定義
   */
  taskDefinition: ecs.FargateTaskDefinition;
  /**
   * 希望するタスク数
   * @default 2
   */
  desiredCount?: number;
  /**
   * サブネット選択
   */
  vpcSubnets?: ec2.SubnetSelection;
  /**
   * セキュリティグループ
   */
  securityGroups?: ec2.ISecurityGroup[];
}

/**
 * レイヤー1: Fargate ServiceConstruct（単一リソース）
 * 
 * 責務: 単一のFargateサービスをセキュアなデフォルト設定で抽象化
 * - マルチAZ配置
 * - ヘルスチェック統合
 * 
 * 変更頻度: ほぼなし（AWSベストプラクティスの更新時のみ）
 */
export class FargateServiceConstruct extends Construct {
  public readonly service: ecs.FargateService;

  constructor(scope: Construct, id: string, props: FargateServiceConstructProps) {
    super(scope, id);

    // Fargate Service（L2コンストラクト）
    this.service = new ecs.FargateService(this, 'Service', {
      serviceName: props.serviceName,
      cluster: props.cluster,
      taskDefinition: props.taskDefinition,
      desiredCount: props.desiredCount || 2,
      vpcSubnets: props.vpcSubnets || {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: props.securityGroups,
      assignPublicIp: false, // セキュリティのためプライベート配置
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
    });
  }
}

export interface FargateTaskDefinitionConstructProps {
  /**
   * ファミリー名
   */
  family: string;
  /**
   * CPU（256, 512, 1024, 2048, 4096）
   * @default 256
   */
  cpu?: number;
  /**
   * メモリ（MB: 512, 1024, 2048, 4096, 8192...）
   * @default 512
   */
  memoryLimitMiB?: number;
}

/**
 * レイヤー1: Fargate TaskDefinitionConstruct（単一リソース）
 * 
 * 責務: 単一のFargateタスク定義を作成
 * 
 * 変更頻度: ほぼなし（AWSベストプラクティスの更新時のみ）
 */
export class FargateTaskDefinitionConstruct extends Construct {
  public readonly taskDefinition: ecs.FargateTaskDefinition;

  constructor(scope: Construct, id: string, props: FargateTaskDefinitionConstructProps) {
    super(scope, id);

    // Fargate TaskDefinition（L2コンストラクト）
    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      family: props.family,
      cpu: props.cpu || 256,
      memoryLimitMiB: props.memoryLimitMiB || 512,
    });
  }

  /**
   * コンテナを追加
   */
  addContainer(
    id: string,
    options: {
      image: ecs.ContainerImage;
      logging?: ecs.LogDriver;
      environment?: { [key: string]: string };
      portMappings?: ecs.PortMapping[];
    }
  ): ecs.ContainerDefinition {
    return this.taskDefinition.addContainer(id, options);
  }
}

