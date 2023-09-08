### Preface
This file is a sample file, demonstrating functionalities of Y-files and its built-in code sections. The contents of this file are transcribed from the [youtube video](https://www.youtube.com/watch?v=f4s1h2YETNY) with the header as below.


### SDF Circle

```y-glsl
float sdCircle( in vec2 p, in float r ) {
    return length(p)-r;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 p = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    vec2 m = (2.0*iMouse.xy-iResolution.xy)/iResolution.y;
    float d = sdCircle(p,0.5);
    
    // coloring
    vec3 col = (d>0.0) ? vec3(0.9,0.6,0.3) : vec3(0.65,0.85,1.0);
    col *= 1.0 - exp(-6.0*abs(d));
    col *= 0.8 + 0.2*cos(150.0*d);
    col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(d)) );

    if( iMouse.z>0.001 ) {
      d = sdCircle(m,0.5);
      col = mix(col, vec3(1.0,1.0,0.0), 1.0-smoothstep(0.0, 0.005, abs(length(p-m)-abs(d))-0.0025));
      col = mix(col, vec3(1.0,1.0,0.0), 1.0-smoothstep(0.0, 0.005, length(p-m)-0.015));
    }

    fragColor = vec4(col,1.0);
}
```

---

## Shader Art Coding Introduction 
Have you ever looked at a breathtaking digital art piece and deeply wondered how they created that? There are many different approaches to digital art but shaders might be one of the most powerful and versatile when it comes to creative coding. Shaders are like the paint brushes of the digital age. They allow you to turn a blank screen into a stunning animation in real time and they're responsible for the stunning visuals in some of your favorite video games and movies. They can be used by creative developers in order to make 2D and 3D renderings exclusively using code. Their imagination being the only limit shader art coding is all about using mathematical functions and algorithms to manipulate pixels and create incredible visual effects. It's a unique fusion of art and science where creativity and precision collide to produce something truly mesmerizing.


```y-glsl
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));

    // Output to screen
    fragColor = vec4(col, 1.0);
}
```


### What are shaders?
But what are shaders you may ask. In essence shaders are small programs that run on your graphics card and are responsible for calculating the color of each pixel on a canvas. Shaders work by taking inputs such as the position of the current pixel and using them to calculate a single final color using the OpenGL Shading Language or **GLSL** in short. It can be seen as a mathematical function that maps a 2D coordinate, the pixel's position represented as X and Y to an output color which in computer graphics is represented by a red green and blue channel. This function is computed in parallel for every pixel on the screen which means that shaders can perform millions of calculations per second to produce stunning real-time graphics. Since discovering shaders about a year ago, I've also made some of my own. It's really fun to learn a new computer graphics technique and make a shader about it. There are so many topics to learn from and so much space for discovery and original creation that it's impossible to get bored. 

While they're great at rendering stunning 3D scenes and even 4D for the particularly brave developers, shaders also excel at rendering 2D images and animations. They usually run blazing fast compared to some heavy 3D shaders that require more performant GPUs and compute power. For over a year now I've been sharing my own trippy animations online mostly in 2D in order for shader coding to get known by a larger audience. Doing so I've received many requests for tutorials and explanations about how to create such visuals using code. In this video I will walk you through the creation of this shader animation from scratch, to give you some insights about how to start making digital art using shaders. Additionally I will provide some useful references and tools that can assist you on your artistic journey and that will be listed in the description I assume a basic knowledge of programming but don't worry if you don't know anything about code. I'll explain every step of the process including the mathematical aspects using visuals that by the way are also made with code.


### Shadertoy
If you want to follow along with this video you can head over to [shadertoy.com](https://www.shadertoy.com). It's a platform where you can easily start writing your own shaders and share them with others and it's a mine of inspiration and knowledge about computer graphics and digital art. I will start from the most basic Shader that gets automatically generated when you click on new. Actually I'll remove all of this to explain from the very beginning what is going on. 


### In/out parameters
Each shader is defined inside the `mainImage` function and has only two parameters. `fragCoord` is the input parameter. It is of type `VEC2` meaning that it's a vector containing two values. The **x** and the **y** coordinate of the current pixel.


### Display colors
`fragColor` is the output parameter and it is of type `VEC4`, because it holds the red green and blue channels as well as an additional alpha channel which stands for the transparency of the pixel. Let's assign a value to that output parameter here we set `fragColor` to a vector of four components using the `VEC4` keyword, then specifying each component's value. The fourth value is the alpha channel. It has no effect in Shadertoy, so I'll keep it to one. In **GLSL** the output color is normalized meaning that each channel ranges from 0 to 1. By setting all channels to zero the output is full black.

Remember that this code is ran for every pixel to determine its color. Here the output color is a constant so it will display a uniform black color across the screen. Similarly by setting all three channels to one we can display full white. By playing with all the possible values for all three channels we can produce millions of unique colors. I should also mention that there is a nice chrome extension for Shadertoy that provides some useful features like this color picker that allow you to convert colors to vectors easily. It's called the Shadertoy unofficial plugin.


### fragCoord
Now let's use the value of the input parameter in order to start seeing some better things than a uniform color. The range of `fragCoord` is dependent on the size of the canvas. For instance if you're rendering on a 1600 by 900 canvas, `x` will range between 0 and 1600 and `y` will range between 0 and 900. However when working with shaders we'll usually want to have these coordinates in clip space, ranging from -1 to 1 so that they do not depend on the current resolution of the canvas. So I will create a new vector called `UV` which will contain our transformed pixel coordinates. The first step is to normalize `fragCoord` so that its components range from 0 to 1. For that we simply need to divide it by a vector containing the current canvas resolution.


### iResolution & swizzling
Fortunately there's a global constant provided by Shadertoy called `iResolution`. It's a vector of three components holding the current canvas size in pixels. The first two components are the width and height of the output texture and the third component is the depth and is only used when rendering to 3D textures. As we're rendering on a 2d canvas we won't use the depth here and the `.xy` syntax is used to isolate the width and height components of the resolution. So that the division happens between vectors of the same size. I'd like to pause for a second here to discuss an important concept widely used in **GLSL** called swizzling. Writing `iRresolution.xy` is equivalent to creating a new `VEC2` and assigning to it the `x` and `y` components of `iResolution` respectively. This concept can be extended further. For instance if we wanted to create a new vector containing only the `y` and `z` components, but in reverse order we could simply write `iResolution.zy`. These swizzling syntaxes are valid in **GLSL** and allow you to easily create arrange and reorder vectors into new ones. It's also important to note that applying the same operation to every corresponding component of the vectors. So let's check if it worked.


### UV Coordinates
I will display the `x` value of this new vector in the red channel only keeping green and blue to zero. We can observe a red gradient that aligns with the fact that the UV `.x` value linearly ranges from 0 to 1 as we move from the left to the right side of the canvas. In a similar way if we display the y-coordinate this time in the green channel only we'll see a green gradient going from the bottom to the top. Now let's display both components at the same time in the red and green channels respectively. The bottom left corner is black because both components are zero and in the top right corner both red and green channels are at one which produces yellow. All other pixel colors contain nuances of red and green that visually represent the value of the UV coordinates. Note that in **GLSL** we can simplify the following expression by merging the first two channels into one and directly writing UV as it contains two values. Now let's start to transform the space in a way that is more convenient to work with.


### Center UVs
Right now our UV coordinates range between **0** and **1**. Meaning that the center pixel coordinate is **0.5**, **0.5**. But it would be preferable to have it exactly at zero zero so the center of the canvas matches with the center of our coordinate space. In order to fix that we can first subtract **0.5** to each component of our `uvVector`. This will shift the space to the upper right and effectively center it. However the corners of the canvas now range from **-0.5** to **0.5** instead of ranging from **-1** to **1**, like we wanted at the start. To achieve this we can multiply the coordinates by 2, resulting in the center remaining at **0** **0** while doubling the UV values of all other pixels to ensure they fit within clip space. As a final step we can clean up the code by condensing it into a single line and eliminating the parentheses. Now that we have this foundation our objective will be to write instructions based on the current pixel coordinate display interesting renderings. There are a multitude of **GLSL** functions at our disposal and in this tutorial we will explore a selection of them.


### length()
We will start by exploring the `length` function. This function takes a vector as its input and calculates the magnitude of that vector. Essentially it calculates the distance between the vector and the origin. Since we have centered our origin we can utilize the `length` function to calculate the distance between any given pixel and the center of the screen by passing in our `uvVector`. This can prove to be extremely useful when creating complex and dynamic renderings. I will create a float value which unlike vectors contains one single decimal number and assign the length of our UV coordinates to it. By setting the red channel of the output color to this value, we can observe a radial gradient expanding from the center. It represents the distance between each pixel and the origin of the canvas transitioning from black to red. Alternatively we can assign this value to all three color channels, creating a grayscale gradient.


### Fix aspect ratio
But before continuing we need to address an issue with the current code. Everything works fine because our canvas is a square and has an aspect ratio of **1**, meaning the width and height are equal. However if we were to change the aspect ratio by making the canvas wider for example we would notice that the circle gets stretched horizontally. This occurs because our UV values always range from 0 to 1 regardless of the canvas's width and height. To fix this issue we need to multiply the X component of our UVS by the current aspect ratio of the canvas, which is its width divided by its height. This adjustment ensures that we avoid any unwanted stretching or distortion effects even when dealing with different canvas sizes and aspect ratios. To really be efficient we can combine our previous UV transformations with this new fix and rewrite it on a single line using basic math simplifications. Now I will subtract **0.5** from this distance.


### Signed Distance Functions
The expression length UV minus **0.5** actually represents the sine distance function of a circle with a radius of **0.5**. A sign distance function or **SDF** is a term used to describe a function that takes a position in space as input and returns the distance from that position to a given shape. It is called signed because the distance is positive outside the shape negative inside the shape and exactly zero at the boundary of the shape. You can find distance functions for a lot of shapes or even make your own. I've linked in the description this article that provides a collection of useful 2D SDF's for various shapes and this website in general is also a mine of useful tutorials about shader coding. So the gradient we're observing represents the signed distance to a circle with a radius of **0.5**. The values are positive outside the circle's edge which creates a gradient but they are negative inside the circle resulting in black. To verify this let's take the absolute value of this distance using the `ABS` function. This will convert the negative values to positive and now we can observe that the distance increases as we move further away from the circle's edge in both directions.


### step()
To achieve a sharper transition we can utilize the `step` function. It accepts two input parameters a threshold and a value and its output can only have two states. It will always return **0** when the value is less than the threshold and **1** otherwise. By applying the step function to the `d` value with a threshold of **0.1** all pixels with a `d` value less than **0.1** will be assigned the color black. While all other pixels will be assigned the color white creating a distinct ring shape.


### smoothstep()
However if we want a smoother transition between black and white we can utilize the wonderful and magical `smoothstep` function. It is similar to the step function but this time takes two threshold values. It assigns the color black when the parameter is below the first threshold and white when it exceeds the second threshold. Within the threshold range it smoothly interpolates the values between **0** and **1**. This gives us complete control over the range and sharpness of the transition. By using this function we can achieve a seamless gradient from black to white between the values of **0** and **0.1**.


### sin() and iTime
Now instead of subtracting **0.5** from the original distance, I will apply the `sin` function to it in order to create a radial repetition of the rings. Currently it only displays a single dot because the sign of a value between **0** and **1** is very close to the original value resulting in minimal change. However when we increase the frequency of the input value we can better see the oscillating pattern of the `sin` function which ranges from **-1** to **1**, and it allows us to generate repeating rings around the center of the image. Note that multiplying The distance by **8** before applying the sine function stretches the space and alters the color intensity requiring a corresponding division of the output by the same factor. One interesting characteristic of the `sin` function is its repetitive nature. By introducing a **time** component and offsetting the distance before applying the `sin` function we can create an infinite loop of rings that continuously shrink towards the center. In this case I am utilizing a global constant called `iTime` which is an ever increasing float representing the number of seconds that have passed since the beginning of the animation.


### 1/x
Now that we have a moving pattern let's focus on improving the visual aspect in colors. I really like to use neon colors and the inverse function `1/x` is perfect for achieving that aesthetic. Instead of calculating the final color using the `smoothstep` function on the `d` value, I will take the inverse of `d`. As a result the screen will become entirely white. So let's take a closer look at the graph of the function to understand what's happening. The graph shows a curve with extremely high outputs for low input values, that gradually diminishes as the values increase. Since we are working in clip space any output value greater than one will be displayed as white and the curve tells us that this is happening if we're taking the inverse of any number that is less than one. However after passing through the sine and absolute functions `d` now ranges strictly from **0** to **1**. Consequently the output can only ever be white. To address this issue we can scale down the inverse function to ensure that the falloff is visible within our desired range of **0** to **1**. It's still a bit much so let's scale it down even further and now we can see a pleasant glow emanating from the rings.


### Add colors
Now let's introduce some color into the composition. I will create a new `VEC3` variable that will initially contain red. By multiplying this color variable with the value of `d` and making it the new shader output. The black areas will remain black, while the white areas will be tinted with the corresponding color value. Also here our calculations are not limited to the **0** **1** range. We can intensify the colors by setting certain components to higher values. In this case the blue channel has the highest value which produces a vibrant blue tint in the final result. To add even more variety to the colors, I will use a very nice function that you can also find on the previous website, and that allows you to create infinitely various color gradients using the power of trigonometry. It produces a color output based on four control parameters of type `VEC3` which are passed as inputs. These per parameters dictate the composition of the gradient, enabling you to customize the colors to suit your preferences. While the function may appear complex with its total of **12** parameters, another website exists that has a user-friendly interface allowing you to visually create your own palettes, and gain a better understanding of how the function operates. After playing for a bit I found a specific palette that I like and I can use the values provided at the bottom of the page to update my code. These values correspond to the `a` `b` `c` and `d` parameters in our palette function. Instead of passing these parameters as inputs to the function I will declare them directly inside the function by creating four new vectors that correspond to the palette I created. With this modification I can replace our constant color with the palette function. It takes our original distance to the center of the screen as input before any transformations. This simple adjustment already adds a captivating and dynamic range of colors to our composition. To enhance readability I will hide the palette function. Afterward I will proceed to adjust the input to the palette by adding a time offset to it. This modification will bring additional dynamism to the colors as the gradient will continuously shift and evolve.


### fract()
Now let's introduce spatial repetition using the `fract` function which is perfect for this purpose. The `fract` function simply returns the fractional part of its input, extracting only the digits after the decimal point. As a result, its output ranges from **0** to **1**. But even if the space has been repeated it seems that something is not working as expected. To understand the issue let's display back only the value of our UV variable. We successfully achieved repetition by creating four smaller versions of our original UV coordinates. However each repetition is now confined within the **0** **1** range instead of the desired clip space. To resolve this we can apply the same solution as before. Scaling the UV's first and then subtracting **0.5** to center them. We finally have nicely repeated the space and we can also shorten all these operations into a single line for brevity. Now `d` represents the local distance relative to the center of each repetition but I'd like to keep track of the original distance to the center of the canvas. I will create a new `VEC2` called `uv0` and assign it the value of our UV coordinates before space repetition has been applied. This will allow us to replace `d` inside the palette by the length of our original UV coordinates which will break the local gradient repetition. It's now time to add the final touch that will give our composition its fractal appearance iterations. Before we proceed, let's slightly rewrite the code for what will follow up. I will create a new `VEC3` variable called final `color` and initialize it with black. Instead of updating the call value directly I will add the result of this operation to our new `color` variable. Finally we will output this final color as the result of our shader. This modification doesn't change the visuals but it sets the stage for adding iterations to our code.


### Iterations
To achieve this we will utilize a `for` loop which is a common algorithmic structure found in many programming languages that allows us to repeat instructions. We will encapsulate our entire color calculation code within this loop. At this stage this simple loop won't produce any visible changes in the visuals as it will exit after just one iteration. By increasing the number of iterations we can observe the emergence of additional layers and intricate details in our fractal pattern. However as the complexity intensifies it may become visually overwhelming. To mitigate this I will reduce the frequency of the time offset. Iterating this code generates interesting patterns because each iteration involves scaling and repeating the space using the fract function and adds the resulting colors together. However the perfect matching of repetitions caused by multiplying by exactly two makes these repetitions match up a bit too well. To introduce more visual interest I will break this symmetry by multiplying with a decimal number instead. I will make use of the exponential function to increase the variations further.


### exp()
I will multiply `d` which is the local distance to the center of each repetition by an exponential function depending on the global distance to the center of the canvas. To try and understand how this works I will make use of yet another website called [graph toy](https://graphtoy.com/) that was specifically designed to graph **GLSL** functions. I will display the identity function as a reference along with the exponential function. Actually we're interested in the exponential of negative `x` we can see that it displays a similar behavior to `1/x` that we used earlier but this time doesn't go to infinity at zero. By multiplying the original `x` value with this function we introduce a smooth and distinctive behavior to our final curve which blends well with the other effects in our current animation. Considering the current brightness intensity I will further reduce the fall off of the inverse function to achieve a more balanced effect. Additionally let's explore the idea of incorporating `i` into the loops calculations. This will introduce additional variation to each layer. To achieve this I will include `i` as part of the input to our color palette function resulting in slight color offsets after each iteration. With the improved visual quality I believe it is appropriate to introduce an additional iteration to enhance the creation of smaller details.


### pow()
As a final touch let's utilize the power function to enhance the overall contrast of the image. When the input ranges from **0** to **1** the `pow` function effectively accentuates the darker colors closer to zero while having a lesser effect on the lighter shades. Although taking the power of two may seem excessive, smaller values such as **1.2** can significantly improve the contrast and visual impact of the composition.


### Conclusion
We could go on and on introducing new functions and new variations to our animation as the **GLSL** language offers limitless possibilities. But I'm happy with these results and sometimes it is also important to recognize when to pause. Take a moment to appreciate what we have created. Reflect on what we have learned and approach new ideas with a fresh and blank canvas.

