using API.Interfaces;

namespace API.Data;

public class UnitOfWork(DataContext context, IUserRepository userRepository, IMessageRepository messagerepository, ILikesRepository likesrepository) : IUnitOfWork
{
    public IUserRepository UserRepository => userRepository;

    public IMessageRepository Messagerepository => messagerepository;

    public ILikesRepository Likesrepository => likesrepository;

    public async Task<bool> CompleteAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public bool HasChanges()
    {
        return context.ChangeTracker.HasChanges();
    }
}
