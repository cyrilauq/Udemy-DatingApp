using CloudinaryDotNet.Actions;

namespace API.Extensions;

public static class CloudinaryExtensions
{
    public static bool HasError(this ImageUploadResult imageUploadResult) => imageUploadResult.Error != null;
}
