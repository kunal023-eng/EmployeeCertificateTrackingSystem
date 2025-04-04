import { Badge } from "@/components/ui/badge";

export const formatDate=(date)=>{
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

export const badgeVariants =(variant)=>{
    switch(variant){
        case "Approved":
            return <Badge className="bg-lime-500 hover:bg-lime-500">{variant}</Badge>;
        case "Rejected":
            return <Badge className="bg-red-500 hover:bg-red-500">{variant}</Badge>;
        case "Reverted":
            return <Badge className="bg-orange-500 hover:bg-orange-500">{variant}</Badge>;
        case "Pending":
            return <Badge className="bg-yellow-500 hover:bg-yellow-500">{variant}</Badge>;
    }
} 