using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Infrastructure.Annotations;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace Inventory.DAL
{
    public class InventoryContext : DbContext
    {
        public InventoryContext()
            : base("DefaultConnection")
        {
            
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Element> Elements { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            Database.SetInitializer(new DropCreateDatabaseIfModelChanges<InventoryContext>());

            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>(); 
            modelBuilder.Conventions.Add<DateTime2Convention>();

            modelBuilder.Entity<Element>().ToTable ("Element", "Common");
            modelBuilder.Entity<Product>().ToTable("Product", "Production");
            
        }

        public override int SaveChanges()
        {
            ChangeTracker.DetectChanges();
            IEnumerable<DbEntityEntry> entries = ChangeTracker.Entries();

            List<EntityBase> addedEntities = new List<EntityBase>();
            List<EntityBase> modifiedEntities = new List<EntityBase>();
            List<EntityBase> deletedEntities = new List<EntityBase>();


            foreach (DbEntityEntry entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    EntityBase ybe = entry.Entity as EntityBase;
                    if (ybe != null)
                    {
                        ybe.Adding();
                        addedEntities.Add(ybe);
                    }
                }
                else if (entry.State == EntityState.Deleted)
                {
                    EntityBase ybe = entry.Entity as EntityBase;
                    if (ybe != null)
                    {
                        ybe.Deleting();
                        deletedEntities.Add(ybe);
                    }
                }
                else if (entry.State == EntityState.Modified)
                {
                    EntityBase ybe = entry.Entity as EntityBase;
                    if (ybe != null)
                    {
                        ybe.Changing();
                        modifiedEntities.Add(ybe);
                    }
                }
            }
            int result = base.SaveChanges();
            return result;
        }
    }
    public class DateTime2Convention : Convention
    {
        public DateTime2Convention()
        {
            
            this.Properties<DateTime>()
                .Configure(c => c.HasColumnType("datetime2"));

        }
    }

}
