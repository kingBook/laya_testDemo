import {axio as axios, APP_ID, TENANT_ID} from './Config'

export interface requstOption<T> {
    options?: any,
    success?: (res:T)=>void;
    error?: (e:any)=>void;
    finally?: ()=>void;
}

export function removeProperty(obj: any){
    if (!obj){
        return obj;
    }
    Object.keys(obj).forEach(item => {
      if (obj[item] === '' || obj[item] === undefined || obj[item] === null || obj[item] === 'null') delete obj[item]
    })
    
    return obj;
}

/**
 * GET请求
 * @T 返回对象Type
 * @K 参数对象Type
 * @url 请求地址
 * @param 请求参数
 **/
export function get<T>(url:string, param?: any, req?:requstOption<T>) {
    const pro: any = axios<T>({
        url,
        method: "GET",
        params: {
            ...removeProperty(param),
            appId: APP_ID,
            tenantId: TENANT_ID
        },
        ...req?.options
    });

    if (req?.success){
        return pro.then((res: T)=>{req?.success ? req?.success(res) : null})
        .catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }else{
        return pro.catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }
}

/**
 * GET请求
 * @T 返回对象Type
 * @K 参数对象Type
 * @url 请求地址
 * @param 请求参数
 **/
 export function getPage<T>(url:string, currentPage: number, pageSize: number, param?: any, req?:requstOption<API.PageData<T>>) {
    // let request: Request = Request.getInstance();
    // const pro: Promise<API.PageData<T>> = request<API.PageData<T>>.get({
    const pro: any = axios<API.PageData<T>>({
        url,
        method: "GET",
        params: {
            ...removeProperty(param),
            current: currentPage,
            size: pageSize,
            appId: APP_ID,
            tenantId: TENANT_ID
        },
        ...req?.options
    });

    if (req?.success){
        return pro.then((res)=>{req?.success ? req?.success(res) : null})
        .catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }else{
        return pro.catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }

}


/**
 * POST请求
 * @T 返回对象Type
 * @K 参数对象Type
 * @url 请求地址
 * @data 请求参数 json模式
 * @param 请求参数 query模式
 **/
export function post<T,K>(url:string, data: K, param?: any, req?:requstOption<T>) {
    // let request: Request = Request.getInstance();
    const pro: any = axios<T>({
        method: "POST",
        url,
        headers:{
            'Content-Type':'application/json'
        },
        data:removeProperty(data),
        params:{
            ...removeProperty(param),
            appId: APP_ID,
            tenantId: TENANT_ID
        },
        ...req?.options
    });

    if (req?.success){
        return pro.then((res)=>{req?.success ? req?.success(res) : null})
        .catch((e)=>{
            console.log(e);
            req?.error ? req?.error(e.response?.data||e) : null;
        })
        .finally(()=>{req?.finally ? req?.finally() : null})
    }else{
        return pro.catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }
}

/**
 * POST请求
 * @T 返回对象Type
 * @K 参数对象Type
 * @url 请求地址
 * @data 请求参数 json模式
 * @param 请求参数 query模式
 **/
export function postBody<T,K>(url:string, body: string, param?: any, req?:requstOption<T>) {
    // let request: Request = Request.getInstance();
    const pro: any = axios<T>({
        url,
        method: "POST",
        headers:{
            'Content-Type':'application/json'
        },
        body: body,
        params:{
            ...removeProperty(param),
            appId: APP_ID,
            tenantId: TENANT_ID
        },
        ...req?.options
    });

    if (req?.success){
        return pro.then((res)=>{req?.success ? req?.success(res) : null})
        .catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }else{
        return pro.catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }
}

/**
 * POST请求
 * @T 返回对象Type
 * @K 参数对象Type
 * @url 请求地址
 * @data 请求参数 form模式
 * @param 请求参数 query模式
 **/
 export function postForm<T,K>(url:string, data: K, param?: any, req?:requstOption<T>) {
    // let request: Request = Request.getInstance();
    const pro: any = axios<T>({
        url,
        method: 'POST',
        headers:{
            'Content-Type':'application/x-www-form-urlencoded'
        },
        requestType: 'form',
        data:removeProperty(data),
        params:{
            ...removeProperty(param),
            appId: APP_ID,
            tenantId: TENANT_ID
        },
        ...req?.options
    });

    if (req?.success){
        return pro.then((res)=>{req?.success ? req?.success(res) : null})
        .catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }else{
        return pro.catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }
}

/**
 * POST请求上传
 * @T 返回对象Type
 * @K 参数对象Type
 * @url 请求地址
 * @data 请求参数 json模式
 * @param 请求参数 query模式
 **/
export function postFile<T,K>(url:string, file: File, fileName: string, param?: any, req?:requstOption<T>) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    // let request: Request = Request.getInstance();
    const pro: any = axios<T>({
        url,
        method: 'POST',
        // headers:{
        //     'Content-Type':'multipart/form-data'
        // },
        requestType: 'form',
        data: formData,
        params:{
            ...removeProperty(param),
            appId: APP_ID,
            tenantId: TENANT_ID
        },
        ...req?.options
    });

    if (req?.success){
        return pro.then((res)=>{req?.success ? req?.success(res) : null})
        .catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }else{
        return pro.catch((e)=>{req?.error ? req?.error(e.response?.data||e) : null})
        .finally(()=>{req?.finally ? req?.finally() : null})
    }
}



/**
 * 格式化搜索条件
 * @param searchParam
 * @returns
 */
 export function formatSearchParam(searchParam: any){
    if (!searchParam){
        return null;
    }
    const exluds = ",isAutoFormat,filter,sorter,size,current,pageSize,proColumns,";//isAutoFormat 是否需要格式化，likeParams 需要进行like的字段
    const pa = searchParam;
    let npa: any = {};
    const getValueType = (columnName: string,proColumns: any[]) =>{
        let cols = proColumns.filter(item=>item.dataIndex == columnName);
        if (cols && cols.length > 0){
            //如果是两个值，只要未被隐藏search=true的值    
            if (cols.length == 2){
                cols = cols.filter(item=>item.search != false);
            }
            return cols[0].valueType;
        }
        return null;
    }
    //是否需要自动格式化查询参数
    if (pa.isAutoFormat){
        if (!pa.proColumns){
            return pa;
        }
        let valueType = "";
        for(let key in pa){
            if (exluds.indexOf(key) == -1){
                valueType = getValueType(key,pa.proColumns);                
                //如果是数组
                if (Array.isArray(pa[key])){
                    //下拉多选
                    if (valueType == "select"){
                        npa[key] = "in|"+pa[key].join(",");
                    }else if (valueType == "dateRange"){//时间区间
                        let dates = "";
                        if (pa[key][0]){
                            dates = ">=|"+pa[key][0];
                        }
                        if (pa[key][1]){
                            dates = (dates.length > 0?dates+"|":"")+"<=|"+pa[key][1];
                        }
                        npa[key] = dates;
                    }else if (valueType == "digitRange"){//数值区间
                        let numbers = "";
                        if (pa[key][0]){
                            numbers = ">=|"+pa[key][0];
                        }
                        if (pa[key][1]){
                            numbers = (numbers.length > 0?numbers+"|":"")+"<=|"+pa[key][1];
                        }
                        npa[key] = numbers;
                    }                 
                }else if (valueType == 'text'){//需要like处理
                    npa[key] = "like|%"+pa[key]+"%";
                }else if(key == "keyword" && pa[key] && pa[key] != ''){
                    let cols = pa.proColumns.filter((col:any)=>col.valueType == 'text');
                    if (cols && cols.length > 0){
                        let colsStr = cols.map((item:any)=>item.dataIndex).join(",");
                        npa[key] = colsStr+"|%"+pa[key]+"%";
                    }
                }else{
                    npa[key] = pa[key];
                }
            }else{
                if (key != 'isAutoFormat' && key != 'proColumns'){
                    npa[key] = pa[key];
                }
            }
        }
    }else{
        npa = searchParam;
    }
    return npa;
}
