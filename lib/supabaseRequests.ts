import { supabaseClient } from "./supabaseClient";

export const getGenimgs = async({ userId, token }: { userId:  string, token: string }) => {
    const supabase = await supabaseClient(token);
    let { data: genimgs, error } = await supabase.from('genimgs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(2);
    return genimgs;
}


export const addGenimg = async({userId, token, apparel_image_url, shade_image_url, gen_image_url }: { userId:  string, token: string, apparel_image_url: string, shade_image_url: string, gen_image_url: string}) => {
    const supabase = await supabaseClient(token); 
    const { data, error } = await supabase.from('genimgs').insert([
    { 
        user_id: userId,
        apparel_image_url: apparel_image_url,
        shade_image_url: shade_image_url,
        gen_image_url: gen_image_url
    },
    ]);

    if(error) {
        console.log("error");
        return;
    }
    return data;
}
