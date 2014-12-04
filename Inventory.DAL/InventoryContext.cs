using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Infrastructure.Annotations;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Inventory.DAL
{
    public class InventoryContext : DbContext
    {
        public InventoryContext()
            : base("DefaultConnection")
        {

        }

        public bool CustomLoggingEnabled { get; set; }

        public DbSet<Product> Products { get; set; }
        public DbSet<Element> Elements { get; set; }
        public DbSet<ChangeLog> ChangeLogs { get; set; }

        public DbSet<Note> Notes { get; set; }



        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            /*
            There are four different database Initialization strategies:

CreateDatabaseIfNotExists: This is default initializer. As name suggests, it will create the database if none exists as per the configuration. However, if you change the model class and then run the application with this initializer, then it will throw an exception.
DropCreateDatabaseIfModelChanges: This initializer drops an existing database and creates a new database, if your model classes (entity classes) have been changed. So you don’t have to worry about maintaining your database schema, when your model classes change.
DropCreateDatabaseAlways: As the name suggests, this initializer drops an existing database every time you run the application, irrespective of whether your model classes have changed or not. This will be useful, when you want fresh database, every time you run the application, while you are developing the application.
Custom DB Initializer: You can also create your own custom initializer, if any of the above don't satisfy your requirements or you want to do some other process that initializes the database using above initializer.
            */

            Database.SetInitializer(new InventoryDbInitializer());
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
            modelBuilder.Conventions.Add<DateTime2Convention>();

            modelBuilder.Entity<Element>().ToTable("Element", "Common");
            modelBuilder.Entity<CustomField>().ToTable("CustomField", "Common");
            modelBuilder.Entity<Product>().ToTable("Product", "CRM");
            modelBuilder.Entity<ChangeLog>().ToTable("ChangeLog", "Admin");
            modelBuilder.Entity<Note>().ToTable("Note", "Common");

        }

        public class InventoryDbInitializer : DropCreateDatabaseIfModelChanges<InventoryContext>
        {
            protected override void Seed(InventoryContext context)
            {
                context.CustomLoggingEnabled = false;

                SeedElements<Town>(context, SeedData.SeedData.TownsString);
                SeedElements<Region>(context, SeedData.SeedData.RegionsString);
                SeedElements<Municipality>(context, SeedData.SeedData.MunicipalitiesString);
                SeedElements<Industry>(context, SeedData.SeedData.IndustriesString);

                context.CustomLoggingEnabled = true;
                
                base.Seed(context);
            }

            private void SeedElements<TElement>(InventoryContext context, string elementsDataWithNewLines) where TElement : Element, new()
            {
                IEnumerable<string> elementsList = elementsDataWithNewLines.Split(new[] { Environment.NewLine }, StringSplitOptions.RemoveEmptyEntries).Distinct().Select(s => s.Trim());

                List<Element> elements = new List<Element>();

                foreach (string industry in elementsList)
                {
                    TElement el = new TElement()
                    {
                        Name = industry
                    };
                    elements.Add(el);

                }
                context.Elements.AddRange(elements);
            }
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
                if (CustomLoggingEnabled)
                {
                    //AuditEntryInChangeLog(entry);
                }

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

        private void AuditEntryInChangeLog(DbEntityEntry entry)
        {
            if (entry.Entity.GetType() != typeof(ChangeLog))
            {
                //ChangeLog cl = new ChangeLog();
                //cl.Operation = Enum.GetName(typeof (EntityState), entry.State);
                //cl.EntityName = entry.Entity.GetType().Name;
                //cl.EntityId = entry.CurrentValues.GetValue<long>("Id");
                switch (entry.State)
                {
                    case EntityState.Added:
                        ChangeLog clAdded = new ChangeLog();
                        SetChangeLogCommonProperties(clAdded, entry);
                        ChangeLogs.Add(clAdded);
                        break;
                    case EntityState.Modified:

                        Type entityType = entry.Entity.GetType();
                        var props = entityType.GetProperties();

                        foreach (PropertyInfo propertyInfo in props)
                        {
                            if (propertyInfo.PropertyType.IsGenericType ||
                                propertyInfo.PropertyType.IsSubclassOf(typeof(EntityBase)))
                            {
                                continue;
                            }
                            var originalValue = entry.OriginalValues.GetValue<object>(propertyInfo.Name);
                            var currentValue = entry.CurrentValues.GetValue<object>(propertyInfo.Name);

                            if (originalValue != currentValue)
                            {
                                ChangeLog clModified = new ChangeLog();
                                SetChangeLogCommonProperties(clModified, entry);

                                if (originalValue != null)
                                {
                                    clModified.OldValue = originalValue.ToString();
                                }
                                else
                                {
                                    clModified.OldValue = null;
                                }

                                if (currentValue != null)
                                {
                                    clModified.NewValue = currentValue.ToString();
                                }
                                else
                                {
                                    clModified.NewValue = null;
                                }


                                clModified.Adding();
                                ChangeLogs.Add(clModified);


                            }
                        }

                        break;
                    case EntityState.Deleted:
                        ChangeLog clDeleted = new ChangeLog();
                        SetChangeLogCommonProperties(clDeleted, entry);
                        ChangeLogs.Add(clDeleted);
                        break;
                }
            }
        }

        private void SetChangeLogCommonProperties(ChangeLog cl, DbEntityEntry entry)
        {
            cl.Operation = Enum.GetName(typeof(EntityState), entry.State);
            cl.EntityName = entry.Entity.GetType().Name;
            cl.EntityId = entry.CurrentValues.GetValue<long>("Id");
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
