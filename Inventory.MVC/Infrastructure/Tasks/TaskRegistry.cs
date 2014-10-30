using StructureMap.Configuration.DSL;
using StructureMap.Graph;

namespace Inventory.MVC.Infrastructure.Tasks
{
    public class TaskRegistry : Registry
    {
        public TaskRegistry()
        {
            Scan(scan =>
            {
                //scan.AssembliesFromApplicationBaseDirectory();
                scan.TheCallingAssembly();
                //	a => a.FullName.StartsWith("")); // ?
                scan.AddAllTypesOf<IRunAtInit>();
                scan.AddAllTypesOf<IRunAtStartup>();
                scan.AddAllTypesOf<IRunOnEachRequest>();
                scan.AddAllTypesOf<IRunOnError>();
                scan.AddAllTypesOf<IRunAfterEachRequest>();
            });
        }
    }
}