using ChordBook.Domain.Common;

namespace ChordBook.Domain.Entities;

public class SongShare : BaseEntity
{
    public string ShareToken { get; private set; } = string.Empty;
    public DateTime? ExpiresAt { get; private set; }

    // Foreign keys
    public Guid SongId { get; private set; }

    // Navigation properties
    public Song Song { get; private set; } = null!;

    private SongShare() { }

    public static SongShare Create(Guid songId, DateTime? expiresAt = null)
    {
        return new SongShare
        {
            SongId = songId,
            ShareToken = GenerateToken(),
            ExpiresAt = expiresAt
        };
    }

    private static string GenerateToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("/", "_")
            .Replace("+", "-")
            .TrimEnd('=');
    }

    public bool IsValid()
    {
        return ExpiresAt == null || ExpiresAt > DateTime.UtcNow;
    }
}
