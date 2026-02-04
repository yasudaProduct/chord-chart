using ChordBook.Domain.Common;

namespace ChordBook.Domain.Entities;

public class Bookmark : BaseEntity
{
    // Foreign keys
    public Guid UserId { get; private set; }
    public Guid SongId { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;
    public Song Song { get; private set; } = null!;

    private Bookmark() { }

    public static Bookmark Create(Guid userId, Guid songId)
    {
        return new Bookmark
        {
            UserId = userId,
            SongId = songId
        };
    }
}
