import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, PlusCircleIcon, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useContacts } from "@/hooks/use-contacts";
import { useState } from "react";

export const ContactItem = ({ user, onDelete, onSelect }) => {
    const handleDelete = async (e) => {
        e.stopPropagation();
        await onDelete(user.clerkId);
    };

    return (

        <div  className='h-full w-full flex justify-between items-center'>
            <div className="w-full flex items-center gap-2">

                <Avatar>
                    <AvatarImage src={user.imageUrl} alt={user.username || user.email} />
                    <AvatarFallback>{user.username || user.firstName} </AvatarFallback>
                </Avatar>
                <span>{user.username || user.email}</span>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild >

                        <Trash2 id="del-icon" onClick={handleDelete} className="z-50 text-red-500   hover:text-red-400   " />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-semibold">

                            delete contact
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
export const SearchItem = ({ user, onDelete, onAdd, isContact }) => {
    const [isLoading,setIsLoading] = useState(false)
    const handleDelete = async (e) => {
        e.stopPropagation();
        await onDelete(user.id);
    };
    const handleAdd = async (e) => {
        e.stopPropagation();
        setIsLoading(true)
        await onAdd(user);
        setIsLoading(false)
    };

    return (
        <div className='h-full w-full flex justify-between items-center'>
            <div className="w-full flex items-center gap-2">
                <Avatar>
                    <AvatarImage src={user.imageUrl} alt={user.username || user.email} />
                    <AvatarFallback>{user.username || user.firstName}</AvatarFallback>
                </Avatar>
                <span>{user.username || user.email}</span>
            </div>
           {isLoading? <Loader2 className="animate-spin" />: <TooltipProvider>

                {isContact ?
                    <Tooltip>
                        <TooltipTrigger className="z-50">

                            <Trash2 onClick={handleDelete} className="text-red-500   hover:text-red-400   " />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>remove from contacts</p>
                        </TooltipContent>
                    </Tooltip>
                    : <Tooltip>
                        <TooltipTrigger>

                            <PlusCircleIcon onClick={handleAdd} className="text-zinc-500 dark:hover:text-white hover:text-zinc-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add to contacts</p>
                        </TooltipContent>
                    </Tooltip>
                }
            </TooltipProvider>}
        </div>
    );
};