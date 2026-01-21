export function getToken() {
  return (
    localStorage.getItem(globalThis.$SystemInfo.webType + '$notx-token') ||
    undefined
  );
}

export function getTokenData() {
  const dataStr =
    localStorage.getItem(globalThis.$SystemInfo.webType + '$notx-token-data') ||
    undefined;
  return dataStr ? JSON.parse(dataStr) : undefined;
}

export function setToken(token: string) {
  localStorage.setItem(globalThis.$SystemInfo.webType + '$notx-token', token);
}

export function changeToken(token: string) {
  localStorage.setItem(globalThis.$SystemInfo.webType + '$notx-token', token);
  var tokenData = getTokenData();
  if (tokenData){
    tokenData.access_token = token;
  }
  setTokenData(tokenData);
}

export function setTokenData(tokenData: API.CustLoginVO) {
  if (tokenData) {
    tokenData.expires_in =
      new Date().getTime() / 1000 + (tokenData.expires_in || 0);
    tokenData.refresh_expires_in =
      new Date().getTime() / 1000 + (tokenData.refresh_expires_in || 0);
    localStorage.setItem(
      globalThis.$SystemInfo.webType + '$notx-token-data',
      JSON.stringify(tokenData),
    );
  }
}

export function removeAll() {
  localStorage.removeItem(globalThis.$SystemInfo.webType + '$notx-token-data');
  localStorage.removeItem(globalThis.$SystemInfo.webType + '$notx-token');
  localStorage.removeItem(globalThis.$SystemInfo.webType + '$notx-current-user');
  localStorage.removeItem(globalThis.$SystemInfo.webType + '$notx-captcha-key');
  localStorage.removeItem("isLogin");
  localStorage.removeItem(globalThis.$SystemInfo.webType + '$_tuuid');
}
