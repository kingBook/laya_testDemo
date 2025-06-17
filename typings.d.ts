declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

// 声明 SVGA 文件
declare module '*.svga';

declare namespace API {
  /**
   * 通用返回格式
   */
  type RT<T> = {
    code?: string; //
    msg?: string;
    success?: boolean;
    data?: T;
  };

  /**
   * 通用分页返回格式
   */
  type PageData<T> = {
      total?: number;
      size?: number;
      datas?: T[];
      current?: number;
      pages?: number;
  }

  type CustLoginVO = {
    access_token?: string; //授权Token
    expires_in?: number; //过期时间：秒
    token_type?: string; //token类型：Basic，Bearer
    refresh_token?: string; //刷新token
    refresh_expires_in?: number; //刷新token失效时间：秒
  };

}
