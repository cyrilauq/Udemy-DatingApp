using System;
using System.Net;
using System.Text.Json;
using API.Errors;

namespace API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context) 
    {
        try 
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, ex.Message);
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = GetResponseException(context.Response.StatusCode, ex);

            string json = SerializeResponseAsJson(response);

            await context.Response.WriteAsync(json);
        }
    }

    private string SerializeResponseAsJson(ApiException response)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(response, options);
        return json;
    }

    private ApiException GetResponseException(int statusCode, Exception ex) {
        return environment.IsDevelopment() 
                ? new ApiException(statusCode, ex.Message, ex.StackTrace)
                : new ApiException(statusCode, ex.Message, "Internal server error");
    }
}
