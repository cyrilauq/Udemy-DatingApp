using System;

namespace API.Errors;

public class ResourceNotFoundException(string message): Exception(message)
{

}
