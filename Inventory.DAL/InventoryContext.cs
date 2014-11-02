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
            /*
            There are four different database Initialization strategies:

CreateDatabaseIfNotExists: This is default initializer. As name suggests, it will create the database if none exists as per the configuration. However, if you change the model class and then run the application with this initializer, then it will throw an exception.
DropCreateDatabaseIfModelChanges: This initializer drops an existing database and creates a new database, if your model classes (entity classes) have been changed. So you don’t have to worry about maintaining your database schema, when your model classes change.
DropCreateDatabaseAlways: As the name suggests, this initializer drops an existing database every time you run the application, irrespective of whether your model classes have changed or not. This will be useful, when you want fresh database, every time you run the application, while you are developing the application.
Custom DB Initializer: You can also create your own custom initializer, if any of the above don't satisfy your requirements or you want to do some other process that initializes the database using above initializer.
            */
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
