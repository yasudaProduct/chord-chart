using ChordBook.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChordBook.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Song> Songs { get; }
    DbSet<SongShare> SongShares { get; }
    DbSet<Bookmark> Bookmarks { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
