using System;

namespace API.Extensions;

public static class IFormFileExtensions
{
    public static bool IsEmpty(this IFormFile formFile) => formFile.Length == 0;
}
