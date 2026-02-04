using ChordBook.Domain.Common;

namespace ChordBook.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } = string.Empty;
    public string? DisplayName { get; private set; }
    public string? AvatarUrl { get; private set; }

    // Navigation properties
    public ICollection<Song> Songs { get; private set; } = new List<Song>();
    public ICollection<Bookmark> Bookmarks { get; private set; } = new List<Bookmark>();

    private User() { }

    public static User Create(string email, string? displayName = null)
    {
        return new User
        {
            Email = email,
            DisplayName = displayName
        };
    }

    public void UpdateProfile(string? displayName, string? avatarUrl)
    {
        DisplayName = displayName;
        AvatarUrl = avatarUrl;
        SetUpdatedAt();
    }
}
