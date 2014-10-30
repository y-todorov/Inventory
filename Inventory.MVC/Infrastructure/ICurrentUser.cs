using Inventory.MVC.Models;

namespace Inventory.MVC.Infrastructure

{
    public interface ICurrentUser
    {
        ApplicationUser User { get; }
    }
}