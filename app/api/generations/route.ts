import { NextResponse } from 'next/server';

export const GET = async (req: Request, res: Response) => {
  console.log("GET REQUEST");
  return new Response("This is a GET API route");
};

// REPLICATE CALL & POLLING
export const POST = async (req: Request, res: Response) => {
  const {apparelImageUrl, shadeImageUrl} = await req.json();
  try {
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + process.env.REPLICATE_API_KEY,
        },
        body: JSON.stringify({
            version:"a2931eb76fdde4505638e596d0b452535e28c94b02a418c4f95accc9084b1eed",
            input: {
                target_image: apparelImageUrl,
                swap_image: shadeImageUrl
            },
        }),
    });
    let jsonStartResponse: any = await startResponse.json();
    let endpointUrl = jsonStartResponse.urls.get;

    let resultImage: string | null = null;
    while (!resultImage) {
        console.log("POLLING");
        let finalResponse = await fetch(endpointUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Token " + process.env.REPLICATE_API_KEY,
            },
        });
        let jsonFinalResponse: any = await finalResponse.json();

        if (jsonFinalResponse.status === "succeeded") {
            resultImage = jsonFinalResponse.output;
        } else if (jsonFinalResponse.status === "failed") {
            break;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    console.log("POLLING ENDED");
    return NextResponse.json(
      {
        message: "OK", resultImage
      },
      {
        status: 201,
      }
    );
  } catch (err) {

    return NextResponse.json(
      {
        message: "ERROR", err
      },
      {
        status: 500,
      }
    );
  }
}
