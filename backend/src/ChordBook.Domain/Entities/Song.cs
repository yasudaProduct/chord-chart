using ChordBook.Domain.Common;
using ChordBook.Domain.Enums;

namespace ChordBook.Domain.Entities;

public class Song : BaseEntity
{
    public string Title { get; private set; } = string.Empty;
    public string? Artist { get; private set; }
    public string? Key { get; private set; }
    public int? Bpm { get; private set; }
    public string TimeSignature { get; private set; } = "4/4";
    public string Content { get; private set; } = "[]"; // JSON content
    public Visibility Visibility { get; private set; } = Visibility.Private;

    // Foreign keys
    public Guid UserId { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;
    public ICollection<SongShare> Shares { get; private set; } = new List<SongShare>();
    public ICollection<Bookmark> Bookmarks { get; private set; } = new List<Bookmark>();

    private Song() { }

    public static Song Create(
        Guid userId,
        string title,
        string? artist = null,
        string? key = null,
        int? bpm = null,
        string timeSignature = "4/4")
    {
        return new Song
        {
            UserId = userId,
            Title = title,
            Artist = artist,
            Key = key,
            Bpm = bpm,
            TimeSignature = timeSignature
        };
    }

    public void UpdateMeta(string title, string? artist, string? key, int? bpm, string timeSignature)
    {
        Title = title;
        Artist = artist;
        Key = key;
        Bpm = bpm;
        TimeSignature = timeSignature;
        SetUpdatedAt();
    }

    public void UpdateContent(string content)
    {
        Content = content;
        SetUpdatedAt();
    }

    public void SetVisibility(Visibility visibility)
    {
        Visibility = visibility;
        SetUpdatedAt();
    }
}
