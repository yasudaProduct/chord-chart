using ChordBook.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChordBook.Infrastructure.Persistence.Configurations;

public class SongConfiguration : IEntityTypeConfiguration<Song>
{
    public void Configure(EntityTypeBuilder<Song> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(s => s.Artist)
            .HasMaxLength(200);

        builder.Property(s => s.Key)
            .HasMaxLength(10);

        builder.Property(s => s.TimeSignature)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(s => s.Content)
            .IsRequired();

        builder.HasOne(s => s.User)
            .WithMany(u => u.Songs)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.Visibility);
    }
}
