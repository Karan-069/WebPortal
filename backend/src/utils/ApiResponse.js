class ApiResponse {
    constructor(
        StatusCode,
        data,
        message = "Success",
        pagination = null
    ){
        this.StatusCode = StatusCode
        this.data = data
        this.message = message
        this.success = StatusCode < 400
        this.pagination = pagination
    }
}

export {ApiResponse}