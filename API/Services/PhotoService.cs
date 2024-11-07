using API.Extensions;
using API.Helpers;
using API.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace API.Services;

public class PhotoService : IPhotoService<ImageUploadResult, DeletionResult>
{
    private readonly Cloudinary _cloudinary;

    public PhotoService(IOptions<CloudinarySettings> cloudinaryConfig)
    {
        var acc = new Account(cloudinaryConfig.Value.CloudName, cloudinaryConfig.Value.ApiKey, cloudinaryConfig.Value.ApiSecret);

        _cloudinary = new Cloudinary(acc);
    }

    public async Task<ImageUploadResult> AddPhotoAsync(IFormFile file)
    {
        var uploadResult = new ImageUploadResult();

        if (file.IsEmpty())
        {
            using var stream = file.OpenReadStream();
            ImageUploadParams uploadParams = ComputeUploadParams(file, stream);

            uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }

        return uploadResult;
    }

    private static ImageUploadParams ComputeUploadParams(IFormFile file, Stream stream)
    {
        return new ImageUploadParams
        {
            File = new FileDescription(file.Name, stream),
            Transformation = ComputeTransformationParams(),
            Folder = "dating-app-udemy-course"
        };
    }

    private static Transformation ComputeTransformationParams()
    {
        return new Transformation().Height(500).Width(500).Crop("fill").Gravity("face");
    }

    public async Task<DeletionResult> DeletePhotoAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);

        return await _cloudinary.DestroyAsync(deleteParams);
    }
}
