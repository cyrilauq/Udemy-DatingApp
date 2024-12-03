using System;
using System.Text;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Extensions;

public static class IdentitServiceExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        serviceCollection.AddIdentityCore<AppUser>(opt => 
        {
            opt.Password.RequiredLength = 8;
        })
            .AddRoles<AppRole>()
            .AddRoleManager<RoleManager<AppRole>>()
            .AddEntityFrameworkStores<DataContext>();
        serviceCollection.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var tokenKey = configuration["TokenKey"] ?? throw new Exception("TokenKey' not found");
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });

        serviceCollection.AddAuthorizationBuilder()
            .AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"))
            .AddPolicy("ModeratePhotoRole", policy => policy.RequireRole("Admin", "Moderator"));
            
        return serviceCollection;
    }
}
