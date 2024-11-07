using System;
using System.Text;
using API.Data;
using API.Helpers;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection servicesCollection, IConfiguration configuration)
    {
        servicesCollection.AddControllers();

        servicesCollection.AddDbContext<DataContext>(options =>
        {
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection"));
        });

        servicesCollection.AddCors();

        servicesCollection.AddScoped<ITokenService, TokenService>();
        servicesCollection.AddScoped<PhotoService, PhotoService>();

        servicesCollection.AddScoped<IUserRepository, UserRepository>();

        servicesCollection.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

        servicesCollection.Configure<CloudinarySettings>(configuration.GetSection("CloudinarySettings"));
        
        return servicesCollection;
    }
}
