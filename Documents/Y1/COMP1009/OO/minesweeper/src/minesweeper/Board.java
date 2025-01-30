package minesweeper;

import java.awt.Color;
import java.util.LinkedList;
import java.util.Random;

// This class does almost of all of the work of implementing the program logic
// e.g., when a button is clicked, it works out how many surrounding mines there are.
// See clickedOnEmptySquareRecursive() or clickedOnEmptySquare() for where most of the work is done
// Board is also (re-)initialised in initialiseAll(), and random mine positions are chosen in createMines();
public class Board
{
	// Board contents
	private BoardSquareButton board[];
	
	// Number of squares wide board is
	private int width;
	
	// Number of squares high board is
	private int height;
	
	// Used for random number generator
	private Random rand = new Random();
	
	// Constructor
	public Board( int w, int h )
	{
		width = w;
		height = h;
		board = new BoardSquareButton[w*h];	// Creates the array of buttons
	}
	
	// Get a button given a specified row/column
	public BoardSquareButton getButton( int x, int y )
	{
		return board[x+y*width];
	}
	
	// Add a new button to the board in a specified position
	public void StoreButton( int x, int y, BoardSquareButton but )
	{
		board[x+y*width] = but;
	}

	// Initialises all of the buttons on the board
	public void initialiseAll()
	{
		for ( int x = 0 ; x < width ; x++ )
			for ( int y = 0 ; y < height ; y++ )
				getButton(x,y).initialise();
	}
	
	// Create a specified number of random mines
	public void createMines( int mines )
	{
		for ( int i = 0 ; i < mines ; i++ )
		{
			while ( true )
			{
				int x = rand.nextInt(width);
				int y = rand.nextInt(height);
				if ( !getButton(x,y).getIsMine() )
				{
					getButton(x,y).setIsMine(true);
					//getButton(x,y).setLabelledAsMine(true); // HACK CHEAT
					break;
				}
			}
		}
	}

	// When we finish we change the colours and text for what actually happened
	public void finished()
	{
		for ( int x = 0 ; x < width ; x++ )
			for ( int y = 0 ; y < height ; y++ )
			{
				BoardSquareButton but = getButton(x, y);
				if ( but.getIsMine() )
				{	// Change all mines you identified to orange (from red)
					but.setText("X");
					if ( !but.isLabelledAsMine() )
						but.setBackground(Color.ORANGE);
				}
				else
				{	// Show count of surrounding mines on each non-mine button
					but.setText( "" + countSurrounding(x, y));
				}
			}
	}
	
	
	// Check that every square was a mine or has been investigated 
	public boolean hasWon()
	{
		for ( int x = 0 ; x < width ; x++ )
			for ( int y = 0 ; y < height ; y++ )
			{	// Have not won if there is a non-mine which has not been marked 
				// Note: De Morgan's : exists non-mine ( NOT marked )
				//      equivalent to: NOT forall non-mines ( marked ) 
				BoardSquareButton but = getButton(x, y);
				if ( !but.getIsMine() && !but.hasBeenInvestigated() )
					return false;
			}
		return true; // All non-mines were marked, because there does not exist one not-marked
	}
	
	
	// Count number of mines around this square. Assuming that current one is not a mine!
	public int countSurrounding( int x, int y )
	{
		int xMin = x-1; if ( xMin < 0 ) xMin = 0;
		int xMax = x+1; if ( xMax >= width ) xMax = width-1;
		int yMin = y-1; if ( yMin < 0 ) yMin = 0;
		int yMax = y+1; if ( yMax >= height ) yMax = height-1;
		int count = 0;
		for ( int xp = xMin ; xp <= xMax ; xp++ )
			for ( int yp = yMin ; yp <= yMax ; yp++ )
				if ( getButton(xp,yp).getIsMine() )
					count++;
		return count;
	}
	
	
	//
	// Recursive version:
	//

	// Square was clicked - recursive check
	// Warning: for an empty square this is recursive.
	// It may end in stack overflow if we are not careful
	// Haskell compiler avoids this, but Java compiler doesn't :(
	public void clickedOnEmptySquareRecursive( int x, int y )
	{
		if ( getButton(x, y).hasBeenInvestigated() )
			return;	// Important: recursion will call us multiple times, so first thing we do is check if we were already 'done'
		
		getButton(x, y).setInvestigated(true);
		
		int surroundingCount = countSurrounding(x,y);
		getButton(x, y).setText( ""+surroundingCount );
		if ( surroundingCount == 0 ) // Expand all surroundings now
		{	// Note: we are going to use recursion to investigate the surroundings
			// There are no mines around us, so we can safely act as if user clicked each surrounding square...
			if ( x > 0 ) // Check 3 squares to the left, IF not on left edge 
			{	
				if ( y > 0 ) // Only go up if not on top, etc for right and bottom
					clickedOnEmptySquareRecursive(x-1,y-1);
				clickedOnEmptySquareRecursive(x-1,y);
				if ( y < (height-1) )
					clickedOnEmptySquareRecursive(x-1,y+1);
			}
			if ( y > 0 )	// Check square above if not at top
				clickedOnEmptySquareRecursive(x,y-1);
			if ( y < (height-1) )	// Check square below if not at bottom
				clickedOnEmptySquareRecursive(x,y+1);
			if ( x < (width-1) )	// Check squares on the right if not on right-hand edge
			{
				if ( y > 0 )
					clickedOnEmptySquareRecursive(x+1,y-1);
				clickedOnEmptySquareRecursive(x+1,y);
				if ( y < (height-1) )
					clickedOnEmptySquareRecursive(x+1,y+1);
			}
		}
	}
	

	//
	// Non-recursive version:
	//
	
	// We will use this class in our listToInvestigate object, to store positions to investigate next
	public static class Pos
	{
		public Pos( int x, int y ) { this.x = x; this.y = y; }
		public int getX() { return x; }
		public int getY() { return y; }
		private int x, y;
	}

	// This is a list of buttons still to investigate, when a button with no mines is found
	LinkedList<Pos> listToInvestigate = new LinkedList<Pos>();

	// If button has not been investigated already then add to investigation list
	void potentiallyAddPos( int x, int y )
	{
		if ( false == getButton(x, y).hasBeenInvestigated() )
		{
			// This has now been investigated
			getButton(x, y).setInvestigated(true);
			// And add to list to ensure that it is investigated
			listToInvestigate.add( new Pos( x, y ) );
		}
	}
	
	// Square was clicked - see clickedOnEmptySquareRecursive for an easier to understand varsion
	// This is NOT recursive, since for a large board you can get a stack overflow
	// Instead, this maintains a list of spaces to investigate as a linked list (object)
	// Add this entry to the list, then process the list one by one, adding each surrounding entry
	// Important: potentiallyAddPos does a check to only add new squares, to avoid looping forever.
	public void clickedOnEmptySquare( int x, int y )
	{
		potentiallyAddPos( x, y );

		while( listToInvestigate.size() > 0 )
		{
			Pos nextPosition = listToInvestigate.removeFirst();
			x = nextPosition.getX();
			y = nextPosition.getY();

			// Set its text to the count - note that it cannot be a mine because its neighbour had zero mines
			int surroundingCount = countSurrounding(x,y);
			getButton(x, y).setText( ""+surroundingCount );
		
			if ( surroundingCount == 0 )
			{	// Check all surrounding cells...
				// There are no mines around us, so we can safely act as if user clicked each surrounding square...
				if ( x > 0 ) // Check 3 squares to the left, IF NOT on left edge 
				{	
					if ( y > 0 ) // Only go up if not on top, etc for right and bottom
						potentiallyAddPos(x-1,y-1);
					potentiallyAddPos(x-1,y);
					if ( y < (height-1) )
						potentiallyAddPos(x-1,y+1);
				}
				if ( y > 0 )	// Check square above IF NOT at top
					potentiallyAddPos(x,y-1);
				if ( y < (height-1) )	// Check square below IF NOT at bottom
					potentiallyAddPos(x,y+1);
				if ( x < (width-1) )	// Check squares on the right IF NOT on right-hand edge
				{
					if ( y > 0 )
						potentiallyAddPos(x+1,y-1);
					potentiallyAddPos(x+1,y);
					if ( y < (height-1) )
						potentiallyAddPos(x+1,y+1);
				}
			}
		}
	}

}
