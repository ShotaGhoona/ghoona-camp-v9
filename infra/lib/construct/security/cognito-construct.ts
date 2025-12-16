import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface CognitoConstructProps {
  /**
   * User Pool名
   */
  userPoolName: string;
  /**
   * セルフサインアップ有効化
   * @default true
   */
  selfSignUpEnabled?: boolean;
  /**
   * MFA設定
   * @default OPTIONAL
   */
  mfa?: cognito.Mfa;
  /**
   * パスワードポリシー
   */
  passwordPolicy?: cognito.PasswordPolicy;
}

/**
 * レイヤー1: Cognito User PoolConstruct（単一リソース）
 * 
 * 責務: 単一のCognito User Poolをセキュアなデフォルト設定で抽象化
 * - MFA対応
 * - セキュアなパスワードポリシー
 * 
 * 変更頻度: ほぼなし（AWSベストプラクティスの更新時のみ）
 */
export class CognitoConstruct extends Construct {
  public readonly userPool: cognito.UserPool;

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    // Cognito User Pool（L2コンストラクト）
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: props.userPoolName,
      selfSignUpEnabled: props.selfSignUpEnabled !== false,
      signInAliases: {
        email: true,
        username: true,
      },
      autoVerify: {
        email: true,
      },
      mfa: props.mfa || cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
      passwordPolicy: props.passwordPolicy || {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY, // 開発環境用
    });
  }

  /**
   * User Pool Clientを追加
   */
  addClient(clientName: string): cognito.UserPoolClient {
    return this.userPool.addClient(clientName, {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
    });
  }
}

