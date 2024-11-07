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

    private ApiException GetResponseException(int statusCode, Exception ex)
    {
        var httpError = GetHttpError(ex.GetType());
        return environment.IsDevelopment()
                ? new ApiException(httpError.Item1, ex.Message, ex.StackTrace)
                : new ApiException(httpError.Item1, ex.Message, httpError.Item2);
    }

    private Tuple<int, string> GetHttpError(Type exceptionType)
    {
        if (exceptionType.Equals(typeof(ResourceNotFoundException)))
        {
            return Tuple.Create((int)HttpStatusCode.NotFound, "Resource Not Found");
        }
        else 
        if (exceptionType.Equals(typeof(BadRequestException)))
        {
            return Tuple.Create((int)HttpStatusCode.BadRequest, "Bad Request");
        }
        return Tuple.Create((int)HttpStatusCode.InternalServerError, "Internal server error");
    }
}
