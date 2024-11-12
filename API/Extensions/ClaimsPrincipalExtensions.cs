using System.Security.Claims;
using API.Errors;

namespace API.Extensions;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// 
    /// </summary>
    /// <param name="claimsPrincipal"></param>
    /// <returns></returns>
    /// <exception cref="BadRequestException">If no username are found in the token</exception>
    public static string GetUsername(this ClaimsPrincipal claimsPrincipal)
    {
        var username = claimsPrincipal.FindFirst(ClaimTypes.Name)?.Value;
        return username ?? throw new BadRequestException("no username found in token");
    }
    
    /// <summary>
    /// 
    /// </summary>
    /// <param name="claimsPrincipal"></param>
    /// <returns></returns>
    /// <exception cref="BadRequestException">If no username are found in the token</exception>
    public static int GetUserId(this ClaimsPrincipal claimsPrincipal)
    {
        var id = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new BadRequestException("no id found in token");
        return int.Parse(id);
    }
}
