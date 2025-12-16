import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../../../config/environment';
import { DataStorageResource } from '../../resource/data-storage-resource';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as rds from 'aws-cdk-lib/aws-rds';

export interface DataStorageStackProps extends cdk.StackProps {
  /**
   * VPC（FoundationStackから渡される）
   */
  vpc: ec2.IVpc;
}

/**
 * レイヤー3: DataStorage Stack（データストレージスタック）
 *
 * 責務: データベースストレージの提供
 * - DynamoDB（NoSQL、オプション）
 * - RDS（デフォルト）/ Aurora（オプション）
 *
 * 含まれるResource: DataStorageResource
 *
 * 変更頻度: 月1回（データスキーマ変更）
 * デプロイ時間: 約5-10分（RDS: 5-7分、Aurora: 7-10分）
 *
 * スタック分離の理由:
 * - データベースは頻繁に変更される
 * - S3バケットとは変更頻度が異なる
 * - データベースのみの部分デプロイが可能
 */
export class DataStorageStack extends cdk.Stack {
  public readonly dynamoTable?: dynamodb.Table;
  public readonly auroraCluster?: rds.DatabaseCluster;
  public readonly rdsInstance?: rds.DatabaseInstance;
  public readonly databaseSecurityGroup?: ec2.ISecurityGroup;

  constructor(
    scope: Construct,
    id: string,
    config: EnvironmentConfig,
    props: DataStorageStackProps
  ) {
    super(scope, id, props);

    // デフォルト値を適用
    const enableDynamo = config.database.enableDynamo ?? false;
    const enableAurora = config.database.enableAurora ?? false;
    const enableRds = config.database.enableRds ?? true;

    // データストレージリソースの作成（Resource層を使用）
    const dataStorage = new DataStorageResource(this, 'DataStorage', {
      enableDynamo,
      dynamoTableName: enableDynamo
        ? `${config.envName}-cdk-template-table`
        : undefined,
      enableAurora,
      enableRds,
      engineType: config.database.engine,
      databaseName: 'main',
      auroraClusterName: `${config.envName}-cdk-template-aurora`,
      rdsInstanceName: `${config.envName}-cdk-template-rds`,
      instanceType: config.database.instanceType,
      multiAz: config.database.multiAz,
      allocatedStorageGb: config.database.allocatedStorageGb,
      readerCount: config.database.readerCount,
      backupRetentionDays: config.database.backupRetentionDays,
      vpc: props.vpc,
      removalPolicy: config.removalPolicy,
    });

    this.dynamoTable = dataStorage.dynamoTable;
    this.auroraCluster = dataStorage.auroraCluster;
    this.rdsInstance = dataStorage.rdsInstance;
    this.databaseSecurityGroup = dataStorage.databaseSecurityGroup;

    // タグ付け
    cdk.Tags.of(this).add('Environment', config.envName);
    cdk.Tags.of(this).add('Project', config.tags.Project);
    cdk.Tags.of(this).add('ManagedBy', config.tags.ManagedBy);
    cdk.Tags.of(this).add('StackType', 'DataStorage');

    // Outputs
    if (this.dynamoTable) {
      new cdk.CfnOutput(this, 'DynamoTableName', {
        value: this.dynamoTable.tableName,
        description: 'DynamoDB Table Name',
        exportName: `${config.envName}-DynamoTableName`,
      });
    }

    // データベースエンドポイント（Aurora/RDS）
    if (this.auroraCluster) {
      new cdk.CfnOutput(this, 'AuroraEndpoint', {
        value: this.auroraCluster.clusterEndpoint.hostname,
        description: 'Aurora Cluster Endpoint',
        exportName: `${config.envName}-AuroraEndpoint`,
      });
    }

    if (this.rdsInstance) {
      new cdk.CfnOutput(this, 'RdsEndpoint', {
        value: this.rdsInstance.instanceEndpoint.hostname,
        description: 'RDS Instance Endpoint',
        exportName: `${config.envName}-RdsEndpoint`,
      });
    }

    // データベース設定情報
    const dbTypes: string[] = [];
    if (enableDynamo) dbTypes.push('DynamoDB');
    if (enableAurora) dbTypes.push('Aurora');
    if (enableRds) dbTypes.push('RDS');
    new cdk.CfnOutput(this, 'EnabledDatabases', {
      value: dbTypes.length > 0 ? dbTypes.join(', ') : 'none',
      description: 'Enabled database types',
      exportName: `${config.envName}-EnabledDatabases`,
    });
  }
}

