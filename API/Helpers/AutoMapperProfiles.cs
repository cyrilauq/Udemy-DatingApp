using API.DTOs;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers;

public class AutoMapperProfiles: Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, MemberDto>()
            .ForMember(d => d.Age, opt => opt.MapFrom(s => s.DateOfBirth.CalculateAge()))
            .ForMember(d => d.PhotoUrl, opt => opt.MapFrom(s => s.Photos.FirstOrDefault(p => p.IsMain)!.Url));
        CreateMap<Photo, PhotoDto>();
        CreateMap<MemberUpdateDto, AppUser>();
        CreateMap<RegisterDto, AppUser>();
        CreateMap<string, DateOnly>()
            .ConvertUsing(s => DateOnly.Parse(s));
    }
}
