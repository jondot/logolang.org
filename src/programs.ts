export const fern = `
PU BK 200 LT 90 FD 100 RT 90 PD
TO FERN :SIZE :SIGN
    if :SIZE > 1 [
        FD :SIZE
        RT 70 * :SIGN FERN :SIZE * 0.5 :SIGN * -1 LT 70 * :SIGN
        FD :SIZE
        LT 70 * :SIGN fern :SIZE * 0.5 :SIGN RT 70 * :SIGN
        RT 7 * :SIGN fern :SIZE - 1 :SIGN LT 7 * :SIGN
        BK :SIZE * 2
    ]
END
FERN 25 1
`
export const house = `
TO RECT :A :B
REPEAT 2 [
		FD :A
		RT 90
		FD :B
		RT 90
]
END
TO HOUSE
		RECT 100 100

		SETCOLOR 0 255 255
		RT 90
		FD 40
		LT 90
		RECT 40 20

		PENUP
		LT 90
		FD 30
		RT 90
		FD 60


		SETCOLOR 0 0 255
		PENDOWN
		RECT 20 20

		PENUP
		RT 90
		FD 60
		LT 90
		
		PENDOWN
		RECT 20 20

		PENUP
		FD 40
		RT 90
		FD 30
		LT 120

		SETCOLOR 255 0 0
		PENDOWN
		FD 100
		LT 120
		FD 100

		LT 30
		FD 100
		RT 180
END
HOUSE 
`

const snowflake = `to SIDE :LEN :DEP
    IF :DEP != 0 [
        SIDE :LEN / 3 :DEP - 1
        LT 60
        SIDE :LEN / 3 :DEP - 1
        RT 120
        SIDE :LEN / 3 :DEP - 1
        LT 60
        SIDE :LEN / 3 :DEP - 1
    ]
    IF :DEP == 0 [
        FD :LEN
    ]
END
TO SNOWFLAKE :LEN :DEP
    REPEAT 3 [
        SIDE :LEN :DEP
        RT 120
    ]
END
SNOWFLAKE 200 4
`

const square = `TO SQUARE :LEN
REPEAT 4 [
		FORWARD :LEN
		RIGHT 90
]
END
SQUARE 100
`

const tree = `TO TREE :SIZE
IF :SIZE > 5 [
		FD :SIZE / 3
		LT 30 TREE :SIZE * 0.66 RT 30
		FD :SIZE / 6
		RT 25 TREE :SIZE / 2 LT 25
		FD :size / 3
		RT 25 TREE :SIZE / 2 LT 25
		FD :SIZE / 6
		BK :SIZE
]
END
TREE 150
`

export const menu = [
  { name: 'Fern', code: fern },
  { name: 'House', code: house },
  { name: 'Snowflake', code: snowflake },
  { name: 'Square', code: square },
  { name: 'Tree', code: tree },
]
