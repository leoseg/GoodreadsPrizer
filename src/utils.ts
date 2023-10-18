/**
 * Validates the format of the credentials
 * @param credentials credentials
 */
export const validateCredentialFormat = (credentials:{
    "GoodReadsUserID":string,
    "GoodReadsUserName":string,
}):boolean =>{
    if(/^\d+$/.test(credentials["GoodReadsUserID"])) return false
    if(/\d/.test(credentials["GoodReadsUserName"])) return false
    return true
}

