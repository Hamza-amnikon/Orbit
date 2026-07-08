using AuthService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Data;

public class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<Role>()
            .HasData(

                new Role
                {
                    Id = 1,
                    Name = "Admin",
                    Description = "System Administrator"
                },

                new Role
                {
                    Id = 2,
                    Name = "HR",
                    Description = "Human Resources"
                },

                new Role
                {
                    Id = 3,
                    Name = "Employee",
                    Description = "Employee"
                }

            );
    }
}