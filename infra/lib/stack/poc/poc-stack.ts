import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../../../config/environment';
import { NetworkResource } from '../../resource/network-resource';
import { DatabaseResource } from '../../resource/database-resource';
import { ApiResource } from '../../resource/api-resource';
import { FrontendResource } from '../../resource/frontend-resource';
import { MessagingResource } from '../../resource/messaging-resource';
import { SecurityResource } from '../../resource/security-resource';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface PocStackProps extends cdk.StackProps {
  /**
   * システム名
   */
  systemName?: string;
  /**
   * 監視アラートを有効化
   * @default true
   */
  enableMonitoring?: boolean;
}

/**
 * PoC Stack（AllInOne構成）
 * 
 * 小規模プロジェクト（MVP、PoC）向けの単一スタック構成
 * すべてのリソース（Network、Database、Security、Backend、Frontend、Integration、Monitoring）を
 * 1つのスタックにまとめる
 * 
 * メリット:
 * - ✅ シンプルで管理が容易
 * - ✅ 学習コストが低い
 * - ✅ 依存関係を気にする必要がない
 * - ✅ 初学者に理解しやすい
 * - ✅ プロトタイプ開発に最適
 * 
 * デメリット:
 * - ❌ 部分デプロイ不可
 * - ❌ 変更の影響範囲が大きい
 * - ❌ デプロイ時間が長い（全体で20-30分）
 * - ❌ CloudFormationの200リソース制限に注意
 * 
 * 推奨プロジェクト規模: < 50リソース
 * 推奨チーム人数: 1-2人
 * 推奨デプロイ頻度: 月1-2回
 * 推奨プロジェクトタイプ: PoC、MVP、個人開発、デモ
 * 
 * 移行パス:
 * プロジェクトが成長したら、以下のスタック分離構成に移行できます：
 * - FoundationStack（ネットワーク基盤）
 * - DataStorageStack（データベースストレージ：DynamoDB + RDS/Aurora）
 * - ObjectStorageStack（オブジェクトストレージ：S3）
 * - SecurityStack（セキュリティ）
 * - BackendStack（バックエンドAPI）
 * - FrontendStack（フロントエンド配信）
 * - IntegrationStack（統合）
 * - ObservabilityStack（監視）
 * 
 * 詳細: docs/MIGRATION_GUIDE.md
 */
export class PocStack extends cdk.Stack {
  // エクスポートされるリソース（必要に応じて他のスタックから参照可能）
  public readonly vpc: ec2.IVpc;
  public readonly apiGatewayUrl: string;
  public readonly frontendUrl: string;
  public readonly dashboard?: cloudwatch.Dashboard;

  constructor(
    scope: Construct,
    id: string,
    config: EnvironmentConfig,
    props?: PocStackProps
  ) {
    super(scope, id, props);

    const systemName = props?.systemName || 'cdk-template';
    // バケット名プレフィックス生成（CDKが自動でユニークなサフィックスを追加）
    const bucketPrefix = `${config.envName}-${systemName}`;

    // ========================================
    // 1. Network（ネットワーク基盤）
    // ========================================
    console.log('📡 Creating Network resources...');
    const network = new NetworkResource(this, 'Network', {
      vpcName: `${config.envName}-${systemName}-vpc`,
      cidr: config.network.cidr,
      maxAzs: config.network.maxAzs,
      natGateways: config.network.natGateways,
    });
    this.vpc = network.vpc;

    // ========================================
    // 2. Database（データストア）
    // ========================================
    console.log('💾 Creating Database resources...');

    // デフォルト値を適用
    const enableDynamo = config.database.enableDynamo ?? false;
    const enableAurora = config.database.enableAurora ?? false;
    const enableRds = config.database.enableRds ?? true;

    const database = new DatabaseResource(this, 'Database', {
      enableDynamo,
      dynamoTableName: enableDynamo ? `${config.envName}-${systemName}-table` : undefined,
      enableAurora,
      enableRds,
      engineType: config.database.engine,
      databaseName: 'main',
      auroraClusterName: `${config.envName}-${systemName}-aurora`,
      rdsInstanceName: `${config.envName}-${systemName}-rds`,
      instanceType: config.database.instanceType,
      multiAz: config.database.multiAz,
      allocatedStorageGb: config.database.allocatedStorageGb,
      readerCount: config.database.readerCount,
      backupRetentionDays: config.database.backupRetentionDays,
      s3BucketName: `${bucketPrefix}-data`, // CDKが自動でユニークなサフィックスを追加
      vpc: network.vpc,
      removalPolicy: config.removalPolicy,
    });
    
    // 💡 PoC推奨: 
    // - 'none': DynamoDBのみで開始（最もコスト効率的）
    // - 'rds': RDS PostgreSQL（コスト効率的、小〜中規模向け）
    // - 'aurora': Aurora PostgreSQL（高コスト、大規模・高可用性が必要な場合のみ）

    // ========================================
    // 3. Security（セキュリティ）
    // ========================================
    // 💡 PoC推奨: 初期段階では認証を無効化
    // ユーザー認証が必要になったら以下のコメントを外してください
    // console.log('🔒 Creating Security resources...');
    // const security = new SecurityResource(this, 'Security', {
    //   userPoolName: `${config.envName}-${systemName}-users`,
    //   userPoolClientName: `${config.envName}-${systemName}-client`,
    //   secretName: `${config.envName}/${systemName}/secrets`,
    // });

    // ========================================
    // 4. Backend API（バックエンド）
    // ========================================
    console.log('🚀 Creating Backend API resources...');
    const api = new ApiResource(this, 'Api', {
      lambdaFunctionName: `${config.envName}-${systemName}-api`,
      apiGatewayName: `${config.envName}-${systemName}-api`,
      ecsClusterName: `${config.envName}-${systemName}-cluster`,
      ecsServiceName: `${config.envName}-${systemName}-backend`,
      albName: `${config.envName}-${systemName}-alb`,
      vpc: network.vpc,
      lambdaConfig: config.lambda, // Lambda設定を渡す（undefinedの場合は作成されない）
    });
    // Lambda有効時はAPI Gateway URL、無効時はALB URLを使用
    this.apiGatewayUrl = api.apiGateway?.url || `http://${api.alb.loadBalancerDnsName}`;

    // ========================================
    // IAM権限設定
    // ========================================
    
    // Lambda関数にDynamoDBの読み書き権限を付与（Lambda有効時かつDynamoDB有効時のみ）
    if (api.lambdaFunction && database.dynamoTable) {
      database.dynamoTable.grantReadWriteData(api.lambdaFunction);
    }
    
    // 💡 PoC推奨: ECSは高コストなため、初期段階ではLambdaのみ使用
    // ECSが必要になったら以下のコメントを外してください
    // database.dynamoTable.grantReadWriteData(
    //   api.ecsService.taskDefinition.taskRole
    // );

    // 💡 RDB（Aurora/RDS）接続設定
    // databaseType='rds'または'aurora'の場合、接続を許可
    if (database.databaseSecurityGroup) {
      const dbPort = database.getDatabasePort() || 5432;
      
      // Lambda関数からのアクセスを許可（Lambda有効時のみ）
      if (api.lambdaFunction) {
        database.databaseSecurityGroup.connections.allowFrom(
          api.lambdaFunction,
          ec2.Port.tcp(dbPort),
          'Allow Lambda to Database'
        );
      }
      
      // 💡 PoC推奨: ECSは高コストなため、初期段階では無効化
      // ECSを使用する場合は以下のコメントを外してください
      // database.databaseSecurityGroup.connections.allowFrom(
    //   api.ecsService,
      //   ec2.Port.tcp(dbPort),
      //   'Allow ECS to Database'
    // );
    }

    // 💡 PoC推奨: S3データバケットは必要になってから有効化
    // S3バケットへのアクセス権限が必要になったら以下のコメントを外してください
    // database.s3Bucket.grantReadWrite(api.lambdaFunction);
    // database.s3Bucket.grantReadWrite(
    //   api.ecsService.taskDefinition.taskRole
    // );

    // ========================================
    // 5. Frontend（フロントエンド）
    // ========================================
    console.log('🎨 Creating Frontend resources...');
    const frontend = new FrontendResource(this, 'Frontend', {
      type: config.frontend.type,
      amplifyAppName: `${config.envName}-${systemName}`,
      githubRepo: config.frontend.githubRepo,
      githubBranch: config.frontend.githubBranch,
      bucketName: config.frontend.type === 's3-cloudfront' ? `${bucketPrefix}-frontend` : undefined,
      comment: `${config.envName} ${systemName} Frontend`,
      removalPolicy: config.removalPolicy,
    });
    
    // Frontend URLの取得（タイプによって変わる）
    if (config.frontend.type === 'amplify' && frontend.amplifyApp) {
      this.frontendUrl = `https://${config.frontend.githubBranch || 'main'}.${frontend.amplifyApp.attrDefaultDomain}`;
    } else if (frontend.distribution) {
    this.frontendUrl = `https://${frontend.distribution.distributionDomainName}`;
    } else {
      this.frontendUrl = 'Not configured';
    }

    // ========================================
    // 6. Integration（メッセージング統合）
    // ========================================
    // 💡 PoC推奨: 初期段階ではメッセージング機能を無効化
    // 非同期処理やイベント駆動が必要になったら以下のコメントを外してください
    // console.log('🔗 Creating Integration resources...');
    // const integration = new MessagingResource(this, 'Integration', {
    //   topicName: `${config.envName}-${systemName}-topic`,
    //   queueName: `${config.envName}-${systemName}-queue`,
    //   dlqName: `${config.envName}-${systemName}-dlq`,
    // });
    //
    // Lambda関数をSNSトピックにサブスクライブ（オプション）
    // integration.addLambdaSubscription(api.lambdaFunction);

    // ========================================
    // 7. Monitoring（監視）
    // ========================================
    // 💡 PoC推奨: 初期段階では基本的なCloudWatch Logsのみ使用
    // 本格的な監視が必要になったら以下のコメントを外してください
    // if (props?.enableMonitoring !== false) {
    //   console.log('📊 Creating Monitoring resources...');
    //   
    //   // CloudWatch Dashboard
    //   this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
    //     dashboardName: `${config.envName}-${systemName}-dashboard`,
    //   });
    //
    //   // ECS CPU使用率（ECS使用時のみ）
    //   // const ecsCpuAlarm = new cloudwatch.Alarm(this, 'EcsCpuAlarm', {
    //   //   alarmName: `${config.envName}-${systemName}-ecs-cpu`,
    //   //   metric: api.ecsService.metricCpuUtilization(),
    //   //   threshold: 80,
    //   //   evaluationPeriods: 2,
    //   //   datapointsToAlarm: 2,
    //   //   comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    //   // });
    //
    //   // Lambda エラー
    //   const lambdaErrorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
    //     alarmName: `${config.envName}-${systemName}-lambda-errors`,
    //     metric: api.lambdaFunction.metricErrors(),
    //     threshold: 5,
    //     evaluationPeriods: 1,
    //     comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    //   });
    //
    //   // Aurora CPU使用率（Aurora使用時のみ）
    //   // const rdsCpuAlarm = new cloudwatch.Alarm(this, 'RdsCpuAlarm', {
    //   //   alarmName: `${config.envName}-${systemName}-rds-cpu`,
    //   //   metric: database.auroraCluster.metricCPUUtilization(),
    //   //   threshold: 80,
    //   //   evaluationPeriods: 2,
    //   //   datapointsToAlarm: 2,
    //   //   comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    //   // });
    //
    //   // Dashboardにウィジェット追加
    //   this.dashboard.addWidgets(
    //     // new cloudwatch.GraphWidget({
    //     //   title: 'ECS Metrics',
    //     //   left: [api.ecsService.metricCpuUtilization()],
    //     //   right: [api.ecsService.metricMemoryUtilization()],
    //     // }),
    //     new cloudwatch.GraphWidget({
    //       title: 'Lambda Metrics',
    //       left: [api.lambdaFunction.metricInvocations()],
    //       right: [api.lambdaFunction.metricErrors()],
    //     }),
    //     // new cloudwatch.GraphWidget({
    //     //   title: 'Aurora Metrics',
    //     //   left: [database.auroraCluster.metricCPUUtilization()],
    //     // }),
    //     new cloudwatch.GraphWidget({
    //       title: 'ALB Metrics',
    //       left: [api.alb.metricRequestCount()],
    //     })
    //   );
    //
    //   // アラームをSNSトピックに送信（Integration有効時のみ）
    //   // lambdaErrorAlarm.addAlarmAction(new actions.SnsAction(integration.topic));
    // }

    // ========================================
    // Tags
    // ========================================
    cdk.Tags.of(this).add('Environment', config.envName);
    cdk.Tags.of(this).add('Project', systemName);
    cdk.Tags.of(this).add('ManagedBy', 'AWS CDK');
    cdk.Tags.of(this).add('StackType', 'AllInOne-PoC');

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `${config.envName}-${systemName}-VpcId`,
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: this.apiGatewayUrl,
      description: 'API Gateway URL',
      exportName: `${config.envName}-${systemName}-ApiUrl`,
    });

    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: api.alb.loadBalancerDnsName,
      description: 'ALB DNS Name',
      exportName: `${config.envName}-${systemName}-AlbDns`,
    });

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: this.frontendUrl,
      description: 'Frontend URL',
      exportName: `${config.envName}-${systemName}-FrontendUrl`,
    });

    // S3+CloudFront使用時のみ出力
    if (frontend.bucket) {
    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontend.bucket.bucketName,
      description: 'Frontend S3 Bucket Name',
      exportName: `${config.envName}-${systemName}-FrontendBucket`,
    });
    }

    // Amplify使用時のみ出力
    if (frontend.amplifyApp) {
      new cdk.CfnOutput(this, 'AmplifyAppId', {
        value: frontend.amplifyApp.attrAppId,
        description: 'Amplify App ID',
        exportName: `${config.envName}-${systemName}-AmplifyAppId`,
      });
    }

    if (database.dynamoTable) {
      new cdk.CfnOutput(this, 'DynamoTableName', {
        value: database.dynamoTable.tableName,
        description: 'DynamoDB Table Name',
        exportName: `${config.envName}-${systemName}-TableName`,
      });
    }

    // データベースエンドポイント（Aurora/RDS）
    const dbEndpoint = database.getDatabaseEndpoint();
    if (dbEndpoint) {
      new cdk.CfnOutput(this, 'DatabaseEndpoint', {
        value: dbEndpoint,
        description: `Database Endpoint (${enableAurora ? 'Aurora' : 'RDS'})`,
        exportName: `${config.envName}-${systemName}-DatabaseEndpoint`,
      });

      new cdk.CfnOutput(this, 'DatabasePort', {
        value: database.getDatabasePort()?.toString() || 'N/A',
        description: 'Database Port',
        exportName: `${config.envName}-${systemName}-DatabasePort`,
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
    });

    // 💡 PoC推奨: Security有効時のみ出力
    // new cdk.CfnOutput(this, 'UserPoolId', {
    //   value: security.userPool.userPoolId,
    //   description: 'Cognito User Pool ID',
    //   exportName: `${config.envName}-${systemName}-UserPoolId`,
    // });

    // 💡 PoC推奨: Integration有効時のみ出力
    // new cdk.CfnOutput(this, 'TopicArn', {
    //   value: integration.topic.topicArn,
    //   description: 'SNS Topic ARN',
    //   exportName: `${config.envName}-${systemName}-TopicArn`,
    // });

    if (this.dashboard) {
      new cdk.CfnOutput(this, 'DashboardUrl', {
        value: `https://console.aws.amazon.com/cloudwatch/home?region=${
          cdk.Stack.of(this).region
        }#dashboards:name=${this.dashboard.dashboardName}`,
        description: 'CloudWatch Dashboard URL',
      });
    }

    // 完了メッセージ
    console.log('✅ PoC Stack creation completed');
    console.log(`📦 All resources created in a single stack: ${id}`);
    console.log(`🌐 Frontend URL: ${this.frontendUrl}`);
    console.log(`🔌 API Gateway URL: ${this.apiGatewayUrl}`);
  }
}

