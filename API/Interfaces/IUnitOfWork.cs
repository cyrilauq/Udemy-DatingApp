namespace API.Interfaces;

public interface IUnitOfWork
{
    IUserRepository UserRepository { get; }
    IMessageRepository Messagerepository { get; }
    ILikesRepository Likesrepository { get; }

    Task<bool> CompleteAsync();
    bool HasChanges();
}
