using ChordBook.Application.Common.Interfaces;
using ChordBook.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChordBook.Api.Middleware;

public class EnsureUserMiddleware
{
    private readonly RequestDelegate _next;

    public EnsureUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        IApplicationDbContext dbContext,
        ICurrentUserService currentUser)
    {
        if (currentUser.IsAuthenticated && currentUser.UserId.HasValue)
        {
            var exists = await dbContext.Users
                .AnyAsync(u => u.Id == currentUser.UserId.Value);

            if (!exists)
            {
                var user = User.CreateWithId(
                    currentUser.UserId.Value,
                    currentUser.Email ?? "");
                dbContext.Users.Add(user);
                await dbContext.SaveChangesAsync(CancellationToken.None);
            }
        }

        await _next(context);
    }
}
