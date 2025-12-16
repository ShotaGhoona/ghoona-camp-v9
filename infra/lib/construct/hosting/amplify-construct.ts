import { Construct } from 'constructs';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as cdk from 'aws-cdk-lib';

export interface AmplifyConstructProps {
  /**
   * アプリ名
   */
  appName: string;
  /**
   * GitHubリポジトリ（オプション）
   * 形式: "owner/repo-name"
   */
  githubRepo?: string;
  /**
   * GitHubブランチ
   * @default 'main'
   */
  githubBranch?: string;
  /**
   * GitHubアクセストークン（Secrets Managerから取得）
   * @default 'github-token'
   */
  githubTokenSecretName?: string;
  /**
   * モノレポのフロントエンドディレクトリ
   * 例: 'frontend' または 'apps/web'
   * @default undefined（リポジトリルート）
   */
  monorepoAppRoot?: string;
  /**
   * 環境変数
   */
  environmentVariables?: { [key: string]: string };
  /**
   * ビルド設定（amplify.yml）
   */
  buildSpec?: string;
}

/**
 * レイヤー1: Amplify Hosting Construct
 * 
 * 責務: AWS Amplify Hostingアプリの作成
 * - Git連携による自動デプロイ
 * - ビルド・デプロイパイプライン
 * - カスタムドメイン対応
 * 
 * 使用例:
 * ```typescript
 * const amplify = new AmplifyConstruct(this, 'Amplify', {
 *   appName: 'my-app',
 *   githubRepo: 'owner/repo-name',
 *   githubBranch: 'main',
 * });
 * ```
 */
export class AmplifyConstruct extends Construct {
  public readonly app: amplify.CfnApp;
  public readonly branch?: amplify.CfnBranch;

  constructor(scope: Construct, id: string, props: AmplifyConstructProps) {
    super(scope, id);

    // モノレポ対応のビルド設定を生成
    const generateBuildSpec = () => {
      if (props.buildSpec) {
        return props.buildSpec;
      }

      const appRoot = props.monorepoAppRoot || '';
      const cdCommand = appRoot ? `cd ${appRoot}` : '';
      const baseDirectory = appRoot ? `${appRoot}/dist` : 'dist';

      return `
version: 1
frontend:
  phases:
    preBuild:
      commands:
        ${cdCommand ? `- ${cdCommand}` : ''}
        - npm ci
    build:
      commands:
        ${cdCommand ? `- ${cdCommand}` : ''}
        - npm run build
  artifacts:
    baseDirectory: ${baseDirectory}
    files:
      - '**/*'
  cache:
    paths:
      ${appRoot ? `- ${appRoot}/node_modules/**/*` : '- node_modules/**/*'}
`;
    };

    // Amplifyアプリの作成
    this.app = new amplify.CfnApp(this, 'App', {
      name: props.appName,
      repository: props.githubRepo,
      accessToken: props.githubTokenSecretName
        ? cdk.SecretValue.secretsManager(props.githubTokenSecretName).unsafeUnwrap()
        : undefined,
      buildSpec: generateBuildSpec(),
      environmentVariables: props.environmentVariables
        ? Object.entries(props.environmentVariables).map(([name, value]) => ({
            name,
            value,
          }))
        : undefined,
      iamServiceRole: undefined, // 必要に応じてIAMロールを指定
      platform: 'WEB',
    });

    // GitHubリポジトリが指定されている場合、ブランチを作成
    if (props.githubRepo) {
      this.branch = new amplify.CfnBranch(this, 'Branch', {
        appId: this.app.attrAppId,
        branchName: props.githubBranch || 'main',
        enableAutoBuild: true,
        enablePullRequestPreview: false, // プルリクエストプレビューは無効
      });
    }

    // Outputs
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: this.app.attrAppId,
      description: 'Amplify App ID',
    });

    new cdk.CfnOutput(this, 'AmplifyDefaultDomain', {
      value: this.app.attrDefaultDomain,
      description: 'Amplify Default Domain',
    });

    if (this.branch) {
      new cdk.CfnOutput(this, 'AmplifyBranchUrl', {
        value: `https://${props.githubBranch || 'main'}.${this.app.attrDefaultDomain}`,
        description: 'Amplify Branch URL',
      });
    }
  }
}

