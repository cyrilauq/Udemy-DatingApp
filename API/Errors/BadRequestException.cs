using System;

namespace API.Errors;

public class BadRequestException(string message): Exception(message)
{

}
