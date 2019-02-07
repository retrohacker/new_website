@title|Debugging GAS ASM with GDB
@created|20160605

This tutorial will walk you through debugging [amd64](https://www.wikiwand.com/en/X86-64) [AT&T ASM](https://www.wikiwand.com/en/X86_assembly_language#/Syntax) using the GNU `as` assembler and `gdb`. Why would you ever want to do this? More than likely you were sitting around bored drinking cocktails and decided to give assembly a try.

# Following along

If you are running an amd64 distribution of Linux, you just need [`gdb`](https://www.gnu.org/software/gdb/), [`ld`](http://linux.die.net/man/1/ld), and [`as`](http://linux.die.net/man/1/as) installed. Otherwise, you need to download [VirtualBox](https://www.virtualbox.org/) and install [amd64 Linux](https://www.debian.org/distrib/) to follow along. The distribution shouldn't matter.

## Example Application

We are going to use an example application that is fairly common. It comes from the book [Programming from the Ground Up](http://download-mirror.savannah.gnu.org/releases//pgubook/ProgrammingGroundUp-1-0-booksize.pdf) by Jonathan Bartlett. In this example, we have attempted to take their code and port it to amd64 using the extra 32-bits of each register. This isn't out of necessity, but for a learning exercise -- in fact, only using the first 16-bits will dramatically increase portability. However, we have made a mistake somewhere, and our application is having unexpected output.

Essentially, what this application does is takes the list of numbers defined at the top and outputs the largest of them as the return value of the application. Simple stuff. Lets take a look at the code:


`FILE: max.S`

```
# Variables: The registers have the following uses:
#
# %edi - Holds the index of the data item being examined
# %ebx - Largest data item found
# %eax - Current data item
#
# The following memory locations are used:
#
# data_items - contains the item data. A 0 is used to terminate the data.
#

.section .data

data_items:
  # These are the data items
  .quad 3, 67, 34, 222, 45, 75, 54, 34, 44, 33, 22, 11, 66, 0

.section .text

.global _start

_start:

init:

  movq  $0, %rdi             # move 0 into the index register
  movq  data_items(,%rdi,4), %rax
  movq  %rax, %rbx            # eax is the biggest when starting

main_loop:

  cmpq  $0, %rax             # check to see if we have reached the list's end
  je    loop_exit
  incq  %rdi
  movq  data_items(,%rdi,4), %rax
  cmpq  %rbx, %rax            # check to see if the new value is larger than max
  jle   main_loop             # if it's smaller, check the next value
  movq  %rax, %rbx            # otherwise, update max and then check the next val
  jmp   main_loop

loop_exit:
  movq  $1, %rax
  int   $0x80
```

The expected output would be 222. In fact, before our alterations it did output 222. But when we tried to use the second half of the registers, the application started returning 0. Let's step through this in GDB

# Assembling and Linking

We need to include debugger symbols in the resulting object file from `as`

Using `man as`, we can see the command `--gstabs+` which will include the stabs debugging information with GNU extensions for `gdb`. So lets use that.

```
$ as -o max.o --gstabs+ max.S
```

Next, we need to pass our object file through the linker, which should leave our symbols intact.

```
$ ld -o max max.o
```

# Loading into GDB

Now lets drop into a debugging session with gdb

```
$ gdb max
GNU gdb (Debian 7.7.1+dfsg-5) 7.7.1
Copyright (C) 2014 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
<http://www.gnu.org/software/gdb/documentation/>.
For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from max...done.
(gdb)
```

We want to drop a breakpoint at the entrypoint of the application, run the application, and then step through until we place 3 (the first value) into the register.

```
(gdb) b _start
Breakpoint 1 at 0x4000b0: file max.S, line 26.
(gdb) run
Starting program: /home/wblankenship/Development/retrohacker.github.io/_posts/max 

Breakpoint 1, init () at max.S:26
26        movq  $0, %rdi             # move 0 into the index register
(gdb) s
27        movq  data_items(,%rdi,4), %rax
(gdb) s
28        movq  %rax, %rbx            # eax is the biggest when starting
(gdb) s
main_loop () at max.S:32
32        cmpq  $0, %rax             # check to see if we have reached the list's end
(gdb) i r
rax            0x3      3
rbx            0x3      3
rcx            0x0      0
rdx            0x0      0
rsi            0x0      0
rdi            0x0      0
rbp            0x0      0x0
rsp            0x7fffffffe650   0x7fffffffe650
r8             0x0      0
r9             0x0      0
r10            0x0      0
r11            0x0      0
r12            0x0      0
r13            0x0      0
r14            0x0      0
r15            0x0      0
rip            0x4000c2 0x4000c2 <main_loop>
eflags         0x202    [ IF ]
cs             0x33     51
ss             0x2b     43
ds             0x0      0
es             0x0      0
fs             0x0      0
gs             0x0      0
```

Here, we use `b` to set a breakpoint at `_start`. We then use `s` to step through the application line by line. Since the symbols stored here are from our ASM source file, we don't need to use `si`. We get to the point where our value has been placed in the register `%rax` and we print the values of all the registers.

That looks okay, we have `3` loaded into the register like we expected. Let's move onto the next value to see what happens.

```
(gdb) s
33        je    loop_exit
(gdb) s
34        incq  %rdi
(gdb) s
35        movq  data_items(,%rdi,4), %rax
(gdb) s
36        cmpq  %rbx, %rax            # check to see if the new value is larger than max
(gdb) i r
rax            0x4300000000     287762808832
rbx            0x3      3
rcx            0x0      0
rdx            0x0      0
rsi            0x0      0
rdi            0x1      1
rbp            0x0      0x0
rsp            0x7fffffffe650   0x7fffffffe650
r8             0x0      0
r9             0x0      0
r10            0x0      0
r11            0x0      0
r12            0x0      0
r13            0x0      0
r14            0x0      0
r15            0x0      0
rip            0x4000d3 0x4000d3 <main_loop+17>
eflags         0x202    [ IF ]
cs             0x33     51
ss             0x2b     43
ds             0x0      0
es             0x0      0
fs             0x0      0
gs             0x0      0
```

Woah! Now that is weird. What is going on here? What is this 287762808832 number? Where did it come from? Let's step again to see if this madness continues.

```
(gdb) s
37        jle   main_loop             # if it's smaller, check the next value
(gdb) s
38        movq  %rax, %rbx            # otherwise, update max and then check the next val
(gdb) s
39        jmp   main_loop
(gdb) s
32        cmpq  $0, %rax             # check to see if we have reached the list's end
(gdb) s
33        je    loop_exit
(gdb) s
34        incq  %rdi
(gdb) s
35        movq  data_items(,%rdi,4), %rax
(gdb) s
36        cmpq  %rbx, %rax            # check to see if the new value is larger than max
(gdb) i r
rax            0x43     67
rbx            0x4300000000     287762808832
rcx            0x0      0
rdx            0x0      0
rsi            0x0      0
rdi            0x2      2
rbp            0x0      0x0
rsp            0x7fffffffe650   0x7fffffffe650
r8             0x0      0
r9             0x0      0
r10            0x0      0
r11            0x0      0
r12            0x0      0
r13            0x0      0
r14            0x0      0
r15            0x0      0
rip            0x4000d3 0x4000d3 <main_loop+17>
eflags         0x202    [ IF ]
cs             0x33     51
ss             0x2b     43
ds             0x0      0
es             0x0      0
fs             0x0      0
gs             0x0      0
```

We have returned to sanity. The next number is 67. So then why was there a nonsensical number between 3 and 67? Let's exit out of the debugging session and take a look at the source file again.

```
(gdb) q
A debugging session is active.

        Inferior 1 [process 19768] will be killed.

Quit anyway? (y or n) y
```

In our source file, specifically this line, we notice something is off:

```
  movq  data_items(,%rdi,4), %rax
```

We are loading in our number 4 bytes at a time, but they are defined as an array of `.quad` which are 8 bytes. So our mysterious number showing up between values is in fact the remaining 4 bytes of each number we are storing!

We update both occurences of this line to:

```
  movq  data_items(,%rdi,8), %rax
```

Re-assemble and re-link, and our problem is solved!

# Conclusion

You just debugged your first assembly programming using GDB!
