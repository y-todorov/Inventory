using System.Reflection;
using System.Resources;
namespace Inventory.DAL
{
    public class Element : EntityBase
    {
        public string Name { get; set; }

        public override string ToString()
        {
            //  ResourceManager rm = new ResourceManager("ViewModelResources",
            //                                   Assembly.GetCallingAssembly());

            //var res = rm.GetString(GetType().Name);

            string result = string.Format("{0} {1}.{2}", GetType().Name, Id, Name);
            return result;

        }

    }
}