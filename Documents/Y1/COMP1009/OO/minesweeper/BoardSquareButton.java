package minesweeper;

import javax.swing.JButton;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;

// This just remembers the state of each button and the colour to draw it in.

public class BoardSquareButton extends JButton
{
	private Color drawColor; // Colour we should be drawing this button
	private int buttonX;	// X position of button in grid
	private int buttonY;	// Y position of button in grid
	private boolean investigated;	// True if player has clicked on it 
	private boolean isMine;	// True if it is a mine
	private boolean labelledAsMine;	// True if player labelled it (right click) as a mine - so we know to change its colour

	// Constructor - called when object is created
	public BoardSquareButton( int width, int height, Color color, int x, int y )
	{
		buttonX = x;
		buttonY = y;
		this.setBackground(drawColor);
		setMinimumSize(	new Dimension(width, height) );
		setPreferredSize( new Dimension(width, height) );
		setFont( new Font("Ariel", Font.BOLD, 30) );
		setText("?");
	}
	
	// Initialise button for the starting state
	public void initialise()
	{
		setText("?");
		drawColor = Color.gray;
		investigated = false;
		isMine = false;
		labelledAsMine = false;
		setButtonColor();
	}
	

	// Set the colour of button when it draws itself according to what the user knows about it...
	public void setButtonColor()
	{
		if ( investigated )
			drawColor = Color.green;
		else if ( labelledAsMine )
			drawColor = Color.red;
		else
			drawColor = Color.gray;
		this.setBackground(drawColor);
	}


	// The remaining methods are just get/set methods for the attributes.
	
	public boolean getIsMine()
	{
		return isMine;
	}

	public void setIsMine(boolean isMine)
	{
		this.isMine = isMine;
		setButtonColor();
	}

	public boolean isLabelledAsMine()
	{
		return labelledAsMine;
	}

	public void setLabelledAsMine(boolean labelledAsMine)
	{
		this.labelledAsMine = labelledAsMine;
		setButtonColor();
	}

	public boolean hasBeenInvestigated()
	{
		return investigated;
	}

	public void setInvestigated(boolean investigated)
	{
		this.investigated = investigated;
		setButtonColor();
	}

	public int getButtonX()
	{
		return buttonX;
	}

	public int getButtonY()
	{
		return buttonY;
	}
}
