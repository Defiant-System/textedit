### Shader Art Coding Introduction 

## Introduction
Have you ever looked at a breathtaking digital art piece and deeply wondered how they created that?
There are many different approaches to digital art but shaders might be one of the most powerful and versatile when it comes to creative coding.
Shaders are like the paint brushes of the digital age.
They allow you to turn a blank screen into a stunning animation in real time and they're responsible for the stunning visuals in some of your favorite video games and movies.
They can be used by creative developers in order to make 2D and 3D renderings exclusively using Code.
Their imagination being the only limit Shader art coding is all about using mathematical functions and algorithms to manipulate pixels and create incredible visual effects.
It's a unique Fusion of Art and Science where creativity and precision Collide to produce something truly mesmerizing.

But what are shaders you may ask.
In essence shaders are small programs that run on your graphics card and are responsible for calculating the color of each pixel on a canvas.
Shaders work by taking inputs such as the position of the current pixel and using them to calculate a single final color using the opengl shading language or glsl in short.

It can be seen as a mathematical function that Maps a 2d coordinate the pixel's position represented as X and Y to an output color which in computer Graphics is represented by a red green and blue Channel.
This function is computed in parallel for every pixel on the screen which means that shaders can perform millions of calculations per second to produce stunning real-time graphics.
Since discovering shaders about a year ago I've also made some of my own 
It's really fun to learn a new computer Graphics technique and make a Shader about it. 
There are so many topics to learn from and so much space for Discovery and original creation that it's impossible to get bored. 

While they're great at rendering stunning 3D scenes and even 4D for the particularly Brave developers, shaders also excel at rendering 2D images and animations.
They usually run blazing fast compared to some heavy 3D shaders that require more performant gpus and compute power.
For over a year now I've been sharing my own trippy animations online mostly in 2D in order for Shader coding to get known by a larger audience.
Doing so I've received many requests for tutorials and explanations about how to create such visuals using code.
In this video I will walk you through the creation of this Shader animation from scratch, to give you some insights about how to start making digital art using shaders.


Additionally I will provide some useful references and tools that can assist you on your artistic journey and that will be listed in the description I assume a basic knowledge of programming but don't worry if you don't know anything about code.
I'll explain every step of the process including the mathematical aspects using visuals that by the way are also made with code.
If you want to follow along with this video you can head over to shadertoy.com
It's a platform where you can easily start writing your own shaders and share them with others and it's a mind of inspiration and knowledge about computer graphics and digital art.
I will start from the most basic Shader that gets automatically generated when you click on new.
Actually I'll remove all of this to explain from the very beginning what is going on. 


Each Shader is defined inside the main image function and has only two parameters. 
Frag cord is the input parameter. 

It is of type vect2 meaning that it's a vector containing two values
The X and the y coordinate of the current pixel.

Frag color is the output parameter and it is of type VEC 4, because it holds the red green and blue channels as well as an additional Alpha Channel which stands for the transparency of the pixel
Let's assign a value to that output parameter here we set frag color to a vector of four components using the vec-4 keyword, then specifying each component's value
The fourth value is the alpha Channel it has no effect in Shader toy, so I'll keep it to one

In glsl the output color is normalized meaning that each Channel ranges from 0 to 1.
By setting all channels to zero the output is full black.

Remember that this code is ran for every pixel to determine its color.
Here the output color is a constant so it will display a uniform black color across the screen


similarly by setting all three channels
to one we can display full white 

by
playing with all the possible values for
all three channels we can produce
millions of unique colors


I should also mention that there is a
nice Chrome extension for Shader toy
that provides some useful features like
this Color Picker that allow you to
convert colors to vectors easily 

it's
called the Shader toy unofficial plugin


now let's use the value of the input
parameter in order to start seeing some
better things than a uniform color

 the
range of frag cord is dependent on the
size of the canvas 


for instance if
you're rendering on a 1600 by 900 canvas
X will range between 0 and 1600 and Y
will range between 0 and 900 

however
when working with shaders we'll usually
want to have these coordinates in clip
space, ranging from -1 to 1 so that they
do not depend on the current resolution
of the canvas

 so I will create a new
Vector called UV which will contain our
transformed pixel coordinates

the first
step is to normalize frag cord so that
its components range from 0 to 1.

for
that we simply need to divide it by a
vector containing the current canvas
resolution 

fortunately there's a global
constant provided by Shader toy called
iResolution

 it's a vector of three
components holding the current canvas
size in pixels

 the first two components
are the width and height of the output
texture and the third component is the
depth and is only used when rendering to
3D textures 

as we're rendering on a 2d
canvas we won't use the depth here and
the dot XY syntax is used to isolate the
width and height components of the
resolution 

so that the division happens
between vectors of the same size 

I'd
like to pause for a second here to
discuss an important concept widely used
in glsl called swizzling 

writing
iRresolution.xy is equivalent to
creating a new vect2 and assigning to it
the X and Y components of iResolution
respectively 

this concept can be
extended further 

for instance if we
wanted to create a new Vector containing
only the Y and Z components, but in
reverse order we could simply write
irresolution.zy

these swizzling syntaxes are valid in
glsl and allow you to easily create
arrange and reorder vectors into new
ones

 it's also important to note that
when performing operations between
vectors that have the same number of
components, it acts as a shortcut


applying the same operation to every
corresponding component of the vectors

so let's check if it worked I will
display the x value of this new Vector
in the red Channel only keeping green
and blue to zero

 we can observe a red
gradient that aligns with the fact that
the UV dot x value linearly ranges from
0 to 1 as we move from the left to the
right side of the canvas

 in a similar
way if we display the y-coordinate this
time in the green Channel only we'll see
a green gradient going from the bottom
to the top

now let's display both components at the
same time in the red and green channels
respectively

the bottom left corner is black because
both components are zero and in the top
right corner both red and green channels
are at one which produces yellow 

all
other pixel colors contain nuances of
red and green that visually represent
the value of the UV coordinates

note that in glsl we can simplify the
following expression by merging the
first two channels into one and directly
writing UV as it contains two values

now let's start to transform the space
in a way that is more convenient to work
with right now our UV coordinates range
between 0 and 1

 meaning that the center
pixel coordinate is 0.5.5 

but it would
be preferable to have it exactly at zero
zero so the center of the canvas matches
with the center of our coordinate space

in order to fix that we can first
subtract 0.5 to each component of our UV
Vector

 this will shift the space to the
upper right and effectively Center it

however the corners of the canvas now
range from minus 0.5 to 0.5 instead of
ranging from -1 to 1 like we wanted at
the start 

to achieve this we can
multiply the coordinates by 2 resulting
in the center remaining at 0 0 while
doubling the UV values of all other
pixels to ensure they fit within clip
space

 as a final step we can clean up
The Code by condensing it into a single
line and eliminating the parentheses 

now
that we have this Foundation our
objective will be to write instructions
based on the current pixel coordinate
display interesting renderings

 there are
a multitude of glsl functions at our
disposal and in this tutorial we will
explore a selection of them 

we will
start by exploring the length function

this function takes a vector as its
input and calculates the magnitude of
that Vector 

essentially it calculates
the distance between the vector and the
origin 

since we have centered our origin
we can utilize the length function to
calculate the distance between any given
pixel and the center of the screen by
passing in our UV Vector 

this can prove
to be extremely useful when creating
complex and dynamic renderings 

I will
create a float value which unlike
vectors contains one single decimal
number and assign the length of our UV
coordinates to it 

by setting the red
channel of the output color to this
value we can observe a radial gradient
expanding from the center 

it represents
the distance between each pixel and the
origin of the canvas transitioning from
black to Red 

alternatively we can assign
this value to all three color channels,
creating a grayscale gradient 

but before
continuing we need to address an issue
with the current code 

everything works
fine because our canvas is a square and
has an aspect ratio of 1, meaning the
width and height are equal 

however if we
were to change the aspect ratio by
making the canvas wider for example we
would notice that the circle gets
stretched horizontally 

this occurs
because our UV values always range from
0 to 1 regardless of the canvas's width
and height

 to fix this issue we need to
multiply the X component of our UVS by
the current aspect ratio of the canvas,
which is its width divided by its height

this adjustment ensures that we avoid
any unwanted stretching or Distortion
effects even when dealing with different
canvas sizes and aspect ratios 

to really
be efficient we can combine our previous
UV Transformations with this new fix and
rewrite it on a single line using basic
math simplifications 

now I will subtract
0.5 from this distance

 the expression
length UV minus 0.5 actually represents
the sine distance function of a circle
with a radius of 0.5

 a sign distance
function or SDF is a term used to
describe a function that takes a
position in space as input and Returns
the distance from that position to a
given shape

 it is called signed because
the distance is positive outside the
shape negative inside the shape and
exactly zero at the boundary of the
shape

 you can find distance functions
for a lot of shapes or even make your
own

 I've Linked In the description this
article that provides a collection of
useful 2dsdfs for various shapes and
this website in general is also a mine
of useful tutorials about Shader coding


so the gradient we're observing
represents the signed distance to a
circle with a radius of 0.5

 the values
are positive outside the circle's Edge
which creates a gradient but they are
negative inside the circle resulting in
Black

 to verify this let's take the
absolute value of this distance using
the ABS function 

this will convert the
negative values to positive and now we
can observe that the distance increases
as we move further away from the
circle's Edge in both directions 

to
achieve a sharper transition we can
utilize the step function 

it accepts two
input parameters a threshold and a value
and its output can only have two states

it will always return 0 when the value
is less than the threshold and one
otherwise

 by applying the step function
to the D value with a threshold of 0.1
all pixels with a d value less than 0.1
will be assigned the color black 

while
all other pixels will be assigned the
color white creating a distinct ring
shape

 however if we want a smoother
transition between black and white we
can utilize the wonderful and magical
smooth step function 

it is similar to
the step function but this time takes
two threshold values 

it assigns the
color black when the parameter is below
the first threshold and white when it
exceeds the second threshold

within the threshold range it smoothly
interpolates the values between 0 and 1.

this gives us complete control over the
range and sharpness of the transition 

by
using this function we can achieve a
seamless gradient from black to white
between the values of 0 and 0.1

now instead of subtracting 0.5 from the
original distance I will apply the sine
function to it in order to create a
radial repetition of the Rings 

currently
it only displays a single dot because
the sign of a value between 0 and 1 is
very close to the original value
resulting in minimal change 

however when
we increase the frequency of the input
value we can better see the oscillating
pattern of the sine function which
ranges from -1 to 1, and it allows us to
generate repeating rings around the
center of the image 

note that
multiplying The Distance by 8 before
applying the sine function stretches the
space and Alters the color intensity
requiring a corresponding division of
the output by the same factor 

one
interesting characteristic of the sine
function is its repetitive nature 

by
introducing a Time component and
offsetting the distance before applying
the sine function we can create an
infinite Loop of rings that continuously
shrink towards the center

in this case I am utilizing a global
constant called iTime which is an ever
increasing float representing the number
of seconds that have passed since the
beginning of the animation

## What are shaders ?
## Shadertoy
## In/out parameters
## Display colors
## fragCoord
## iResolution & swizzling
## uv coordinates
## Center uvs
## length()
## Fix aspect ratio
## Signed Distance Functions
## step()
## smoothstep()
## sin() and iTime
## 1/x
## Add colors
## fract()
## Iterations
## exp()
## pow()
## Conclusion