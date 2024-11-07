using CloudinaryDotNet.Actions;

namespace API.Interfaces;

/// <summary>
/// 
/// </summary>
/// <typeparam name="A">Type of the add result</typeparam>
/// <typeparam name="D">Type of the deletion result</typeparam>
public interface IPhotoService<A, D>
{
    Task<A> AddPhotoAsync(IFormFile file);
    Task<D> DeletePhotoAsync(string publicId);
}
