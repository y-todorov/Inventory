using System;
using System.Linq;
using System.Reflection;
using System.Web;

namespace Inventory.DAL
{
    public class EntityBase
    {
        public long Id { get; set; }

        public DateTime? CreatedOn { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? ModifiedOn { get; set; }

        public string ModifiedBy { get; set; }

        public virtual void Adding() 
        {
            SetCreatedOnCreatedBy();
            SetModifiedOnModifiedBy();
        }

        public virtual void Changing()
        {
            SetModifiedOnModifiedBy();
        }

        public virtual void Deleting()
        {
            
        }

        private void SetCreatedOnCreatedBy()
        {
            string userName = null;
            if (HttpContext.Current != null && HttpContext.Current.User != null)
            {
                userName = HttpContext.Current.User.Identity.Name;
            }
            CreatedBy = userName;
            CreatedOn = DateTime.Now;
        }
        private void SetModifiedOnModifiedBy()
        {
            string userName = null;
            if (HttpContext.Current != null && HttpContext.Current.User != null)
            {
                userName = HttpContext.Current.User.Identity.Name;
            }
            ModifiedBy = userName;
            ModifiedOn = DateTime.Now;
        }
    }
}