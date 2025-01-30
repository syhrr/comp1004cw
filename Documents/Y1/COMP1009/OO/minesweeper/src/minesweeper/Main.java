package minesweeper;

import java.awt.Color;
import java.awt.GridLayout;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;

import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.SwingUtilities;

public class Main implements MouseListener
{
	// Main function - where the program starts
	public static void main(String[] args)
	{		
		// Note: you could probably just create a new Main() object from this thread if you wanted to
		// i.e. 
		// new Main();	// Create one object then 'end'
		// This is safer for using Swing though as we know that the constructor creates a GUI object
		SwingUtilities.invokeLater(new Runnable() // This is an example of an anonymous subclass of Runnable
		{
			public void run()
			{
				new Main();	// Create one object then 'end'
			}
		});
	}

	// final makes these 'constants' (like const in some other languages)
	private static final int WIDTH = 20;
	private static final int HEIGHT = 20;
	private static final int NUMBER_MINES = 20;
	
	// Our program has one board object
	private Board board = new Board( WIDTH, HEIGHT );
	
	// It also has one frame object - which is the display on the screen
	private JFrame guiFrame;
	
	// Constructor - main calls this by creating an object
	public Main() 
	{
		guiFrame = new JFrame(); 
    	guiFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    	guiFrame.setTitle("Minesweeper"); 
    	//guiFrame.setLocationRelativeTo(null);  // centre on screen
    	guiFrame.setLayout( new GridLayout(HEIGHT,WIDTH,0,0) ); // Layout : how to layout components
    	// Create the grid of buttons
    	for ( int y = 0 ; y < HEIGHT ; y++ )
        	for ( int x = 0 ; x < WIDTH ; x++ )
        	{
        		BoardSquareButton but = new BoardSquareButton( 60, 60, Color.RED, x, y );
        		final int xv = x; final int yv = y;
        		but.addMouseListener(this);	// Tell button object to inform the Main object if it was clicked - by left or right mouse button
        		board.StoreButton(x, y, but); // Tell the board object that this button is on it
        		guiFrame.getContentPane().add( but ); // Add the button to the frame, so it shows on screen
        	}
        board.initialiseAll();
        board.createMines(NUMBER_MINES);
        
    	guiFrame.pack(); 
    	guiFrame.setVisible(true);	// Note a side-effect of this is to keep the program running
	}

	public void buttonLeftClicked( BoardSquareButton but )
	{
		if ( but.getIsMine() )
		{
			board.finished();
			JOptionPane.showMessageDialog( guiFrame, "You lost!");
	        board.initialiseAll();
	        board.createMines(NUMBER_MINES);
	        guiFrame.repaint();
		}
		else
		{
			// Iterative approach - storing a list of buttons to check:
			//board.clickedOnEmptySquare( but.getButtonX(), but.getButtonY() );
			
			// Recursive approach - may run out of stack space, but may be easier to understand
			board.clickedOnEmptySquareRecursive( but.getButtonX(), but.getButtonY() );
			
			if ( board.hasWon())
			{
				board.finished();
				JOptionPane.showMessageDialog( guiFrame, "You won!");
		        board.initialiseAll();
		        board.createMines(NUMBER_MINES);
		        guiFrame.repaint();
			}
		}
	}
	
	public void buttonRightClicked( BoardSquareButton but )
	{
		int x = but.getButtonX();
		int y = but.getButtonY();
		board.getButton(x, y).setLabelledAsMine( !board.getButton(x, y).isLabelledAsMine() );
        guiFrame.repaint();
	}
	
	// We could handle the mouse click (left or right) here
	@Override
	public void mouseClicked(MouseEvent e)
	{
	}

	// I handled the mouse click here by detecting the press rather than click
	@Override
	public void mousePressed(MouseEvent e) 
	{
		// Handle the click of mouse
		if ( e.getButton() == MouseEvent.BUTTON1 ) // Left-click
		{
			buttonLeftClicked( (BoardSquareButton)e.getSource() );
		}
		else if ( e.getButton() == MouseEvent.BUTTON3 ) // Right-click
		{
			buttonRightClicked( (BoardSquareButton)e.getSource() );
		}
	}
	
	// Unused but added because we needed mouseClicked() and they come as a 'set' on the interface
	@Override
	public void mouseReleased(MouseEvent e) 
	{
	}

	// Unused but added because we needed mouseClicked() and they come as a 'set' on the interface
	@Override
	public void mouseEntered(MouseEvent e) {}

	// Unused but added because we needed mouseClicked() and they come as a 'set' on the interface
	@Override
	public void mouseExited(MouseEvent e) {}
	
}
